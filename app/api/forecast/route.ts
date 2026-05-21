import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { fetchAllPrices, fetchEarthquakes } from '@/lib/api';
import { saveLogToNAS } from '@/lib/nas';
import https from 'https';

// Helper to perform HTTP POST requests for Gemini API
function httpsPost(url: string, payload: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(payload);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP POST Status: ${res.statusCode}, Body: ${data.substring(0, 150)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timeout'));
    });
    
    req.write(body);
    req.end();
  });
}

/**
 * Request forecast from Gemini API using context bias feedback
 */
async function askGeminiForecast(
  target: string, 
  currentPrice: number, 
  biasOffset: number, 
  apiKey: string
): Promise<{ direction: 'UP' | 'DOWN' | 'FLAT'; reason: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = `You are the World Forecast System AI. Predict the price direction of ${target} in the next 10 minutes.
Current price: ${currentPrice}
Your recent prediction bias offset: ${biasOffset.toFixed(4)} (Positive means you previously predicted DOWN/FLAT too much and underestimated. Negative means you predicted UP too much and overestimated).
Analyze the trend, apply the bias correction, and output a forecast.
Output MUST be a JSON object with two fields:
- "direction": choose from "UP", "DOWN", or "FLAT"
- "reason": a short explanation (max 60 characters in Japanese).
Example: {"direction": "UP", "reason": "短期移動平均のゴールデンクロスと下降バイアスの補正"}
Do not output markdown code blocks. Output raw JSON only.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const responseText = await httpsPost(url, payload);
  const responseJson = JSON.parse(responseText);
  const textContent = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Empty Gemini response');
  }

  const result = JSON.parse(textContent.trim());
  if (['UP', 'DOWN', 'FLAT'].includes(result.direction) && typeof result.reason === 'string') {
    return {
      direction: result.direction,
      reason: result.reason
    };
  }
  throw new Error('Invalid JSON structure returned by Gemini');
}

/**
 * Local hybrid mathematical model incorporating bias offsets as a fallback
 */
function localModelForecast(
  target: string,
  currentPrice: number,
  biasOffset: number
): { direction: 'UP' | 'DOWN' | 'FLAT'; reason: string } {
  // Simulate a trend based on mock random walk + momentum + bias offset
  // In a real scenario, this computes short-term moving average slopes
  const randomFactor = (Math.random() - 0.5) * 0.0005; // Volatility
  const combinedScore = randomFactor + (biasOffset * 0.001);

  let direction: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
  let reason = '';

  if (combinedScore > 0.00005) {
    direction = 'UP';
    reason = biasOffset < 0 
      ? '下降トレンドの検出および過大上昇予測に対する負のバイアス補正'
      : 'モメンタム指標の上昇サインと安定バイアス傾向';
  } else if (combinedScore < -0.00005) {
    direction = 'DOWN';
    reason = biasOffset > 0
      ? '上昇トレンドの減衰および過大下降予測に対する正のバイアス補正'
      : '売りシグナルの検知と下降バイアストレンドの反映';
  } else {
    direction = 'FLAT';
    reason = 'オシレーター指標の均衡状態およびレンジ相場の予測';
  }

  return { direction, reason };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fastMode = searchParams.get('fast') === 'true' || process.env.DEBUG_FAST_EVAL === 'true';
    const intervalThreshold = fastMode ? 60 : 600; // Fast: 1 minute, Normal: 10 minutes

    const now = Math.floor(Date.now() / 1000);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Fetch current prices for evaluation and new forecasts
    const currentPrices = await fetchAllPrices();

    // === PROCESS A: EVALUATION (10-MINUTE ANSWER ANSWER ANSWER) ===
    const pendingPredictions = db.prepare(`
      SELECT * FROM predictions 
      WHERE status = 'PENDING' AND target_time <= ?
    `).all(now) as any[];

    const evaluatedLogs: string[] = [];
    const updatePredictionStmt = db.prepare(`
      UPDATE predictions 
      SET actual_price = ?, accuracy_score = ?, status = 'RESOLVED', evaluation_time = ?
      WHERE id = ?
    `);

    const selectBiasStmt = db.prepare('SELECT * FROM ai_bias_feedback WHERE target = ?');
    const updateBiasStmt = db.prepare(`
      UPDATE ai_bias_feedback 
      SET bias_offset = ?, total_predictions = ?, correct_predictions = ?, last_updated = ?
      WHERE target = ?
    `);

    for (const pred of pendingPredictions) {
      const currentPrice = currentPrices[pred.target];
      if (currentPrice === undefined) continue;

      const diff = currentPrice - pred.prediction_price;
      let actualDirection: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
      
      // Calculate actual direction based on threshold
      // For simple evaluation, any change counts
      if (diff > 0) {
        actualDirection = 'UP';
      } else if (diff < 0) {
        actualDirection = 'DOWN';
      }

      const isCorrect = pred.predicted_direction === actualDirection;
      const accuracyScore = isCorrect ? 1.0 : 0.0;

      // Update prediction record
      updatePredictionStmt.run(currentPrice, accuracyScore, now, pred.id);

      // Retrieve and update AI bias info
      let biasInfo = selectBiasStmt.get(pred.target) as any;
      if (!biasInfo) {
        biasInfo = { target: pred.target, bias_offset: 0.0, total_predictions: 0, correct_predictions: 0 };
      }

      let newBiasOffset = biasInfo.bias_offset;
      if (isCorrect) {
        // Shrink bias offset towards 0 (decay) if prediction was correct
        newBiasOffset *= 0.9;
      } else {
        // Adjust bias offset to correct overestimation
        if (pred.predicted_direction === 'UP' && actualDirection !== 'UP') {
          // AI predicted UP but it fell/stayed flat -> Decrease bias offset to lean more DOWN next time
          newBiasOffset -= 0.05;
        } else if (pred.predicted_direction === 'DOWN' && actualDirection !== 'DOWN') {
          // AI predicted DOWN but it rose/stayed flat -> Increase bias offset to lean more UP next time
          newBiasOffset += 0.05;
        }
      }

      const total = biasInfo.total_predictions + 1;
      const correct = biasInfo.correct_predictions + (isCorrect ? 1 : 0);
      updateBiasStmt.run(newBiasOffset, total, correct, now, pred.target);

      const statusMsg = isCorrect ? '的中' : 'ハズレ';
      evaluatedLogs.push(
        `${pred.target} 判定: ${statusMsg} (予測: ${pred.predicted_direction}, 実測価格: ${currentPrice}, 誤差バイアス: ${newBiasOffset.toFixed(3)})`
      );

      // A:ドライブ(NAS)へログを永続化保存（例外をキャッチして安全に実行）
      await saveLogToNAS({
        id: pred.id,
        target: pred.target,
        predicted_direction: pred.predicted_direction,
        prediction_price: pred.prediction_price,
        prediction_time: pred.prediction_time,
        target_time: pred.target_time,
        actual_price: currentPrice,
        status: 'RESOLVED',
        accuracy_score: accuracyScore,
        evaluation_time: now,
        reason: pred.reason,
        bias_offset: newBiasOffset
      });
    }

    // === PROCESS B: GENERATE NEW FORECASTS ===
    const newForecasts: any[] = [];
    const insertPredictionStmt = db.prepare(`
      INSERT INTO predictions (target, predicted_direction, prediction_price, prediction_time, target_time, status, reason)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
    `);

    // Only forecast if there are no currently PENDING forecasts for the target, or if fastMode is on
    // To keep it clean, we create forecasts for targets that do not have a PENDING state
    for (const [target, price] of Object.entries(currentPrices)) {
      const activePending = db.prepare('SELECT COUNT(*) as count FROM predictions WHERE target = ? AND status = \'PENDING\'').get(target) as any;
      
      if (activePending.count > 0 && !fastMode) {
        continue; // Skip if we already have an active pending prediction for this symbol
      }

      const biasInfo = selectBiasStmt.get(target) as any || { bias_offset: 0.0 };
      let forecast: { direction: 'UP' | 'DOWN' | 'FLAT'; reason: string };

      try {
        if (geminiApiKey) {
          forecast = await askGeminiForecast(target, price, biasInfo.bias_offset, geminiApiKey);
        } else {
          forecast = localModelForecast(target, price, biasInfo.bias_offset);
        }
      } catch (err: any) {
        console.warn(`Forecast generation failed for ${target} using Gemini. Falling back to local: ${err.message}`);
        forecast = localModelForecast(target, price, biasInfo.bias_offset);
      }

      const targetTime = now + intervalThreshold;
      insertPredictionStmt.run(target, forecast.direction, price, now, targetTime, forecast.reason);
      newForecasts.push({
        target,
        current_price: price,
        predicted_direction: forecast.direction,
        reason: forecast.reason,
        prediction_time: now,
        target_time: targetTime
      });
    }

    // Fetch latest earthquakes to pass to client
    const earthquakes = await fetchEarthquakes();

    // Query updated statistics to return to front-end
    const stats = db.prepare(`
      SELECT target, bias_offset, total_predictions, correct_predictions FROM ai_bias_feedback
    `).all();

    const recentPredictions = db.prepare(`
      SELECT * FROM predictions ORDER BY id DESC LIMIT 20
    `).all();

    return NextResponse.json({
      success: true,
      time: now,
      evaluated_count: pendingPredictions.length,
      evaluated_logs: evaluatedLogs,
      new_forecasts: newForecasts,
      current_prices: currentPrices,
      earthquakes: earthquakes,
      stats: stats,
      recent_predictions: recentPredictions
    });
  } catch (error: any) {
    console.error('API Error inside /api/forecast:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
