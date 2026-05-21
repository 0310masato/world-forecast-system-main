import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { fetchAllPrices, fetchEarthquakes } from '@/lib/api';
import { saveLogToNAS, saveDailySummaryToNAS } from '@/lib/nas';
import https from 'https';
import { fetchLatestNews, NewsItem } from '@/lib/news';

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
  apiKey: string,
  news: NewsItem[]
): Promise<{ direction: 'UP' | 'DOWN' | 'FLAT'; reason: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const newsListStr = news.map((item, idx) => `[${idx + 1}] Source: ${item.source} | Title: ${item.title}`).join('\n');
  
  const prompt = `You are the World Forecast System AI. Predict the price direction of ${target} in the next 10 minutes.
Current price: ${currentPrice}
Your recent prediction bias offset: ${biasOffset.toFixed(4)} (Positive means you previously predicted DOWN/FLAT too much and underestimated. Negative means you predicted UP too much and overestimated).

Current latest global news:
${newsListStr}

Analyze the trend, apply the bias correction, and consider the global news context. Make sure you base your prediction on both the bias offset and the global news context, and mention the news source and topic in your reason.
Output MUST be a JSON object with two fields:
- "direction": choose from "UP", "DOWN", or "FLAT"
- "reason": a short explanation (max 60 characters in Japanese) referencing the news source and topic you based your reasoning on (e.g. "[CNBC] 米金利動向に伴う原油価格の上昇予測" or "[Bloomberg] 日銀利上げ観測による円高予測").
Example: {"direction": "UP", "reason": "[Reuters] 連邦準備理事会の利下げ示唆に伴うドル下落・金高予測"}
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
    let finalReason = result.reason;
    if (finalReason.length > 60) {
      finalReason = finalReason.substring(0, 57) + '...';
    }
    return {
      direction: result.direction,
      reason: finalReason
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
  biasOffset: number,
  news: NewsItem[]
): { direction: 'UP' | 'DOWN' | 'FLAT'; reason: string } {
  const randomFactor = (Math.random() - 0.5) * 0.0005;
  const combinedScore = randomFactor + (biasOffset * 0.001);

  let direction: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
  let reason = '';

  const relevantNews = news.filter(n => n.relatedAsset === target);
  const newsItem = relevantNews.length > 0 
    ? relevantNews[Math.floor(Math.random() * relevantNews.length)]
    : (news.length > 0 ? news[Math.floor(Math.random() * news.length)] : null);

  const newsSource = newsItem ? newsItem.source : 'Market';
  const newsTopic = newsItem 
    ? (newsItem.title.length > 25 ? newsItem.title.substring(0, 22) + '...' : newsItem.title)
    : '指標動向';

  if (combinedScore > 0.00005) {
    direction = 'UP';
    reason = biasOffset < 0 
      ? `[${newsSource}] 過小予測のバイアス補正と「${newsTopic}」による上昇予測`
      : `[${newsSource}] 「${newsTopic}」の材料視とモメンタム好転`;
  } else if (combinedScore < -0.00005) {
    direction = 'DOWN';
    reason = biasOffset > 0
      ? `[${newsSource}] 過大予測のバイアス補正と「${newsTopic}」による下落予測`
      : `[${newsSource}] 「${newsTopic}」の警戒に伴う売り圧力`;
  } else {
    direction = 'FLAT';
    reason = `[${newsSource}] 「${newsTopic}」報道後のレンジ相場予測`;
  }

  if (reason.length > 60) {
    reason = reason.substring(0, 57) + '...';
  }

  return { direction, reason };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fastMode = searchParams.get('fast') === 'true' || process.env.DEBUG_FAST_EVAL === 'true';
    const intervalThreshold = fastMode ? 60 : 600;

    const now = Math.floor(Date.now() / 1000);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Fetch current prices and latest news
    const { prices: currentPrices, changes24h } = await fetchAllPrices();
    const news = await fetchLatestNews();

    // Calculate aggregated market impacts / risk premiums for assets
    const marketImpacts: Record<string, { direction: 'UP' | 'DOWN' | 'FLAT'; riskPremium: number; reason: string }> = {
      BTC: { direction: 'FLAT', riskPremium: 0, reason: '特段の材料なし' },
      USD_JPY: { direction: 'FLAT', riskPremium: 0, reason: '特段の材料なし' },
      Crude_Oil: { direction: 'FLAT', riskPremium: 0, reason: '特段の材料なし' },
      Gold: { direction: 'FLAT', riskPremium: 0, reason: '特段の材料なし' },
      SP500: { direction: 'FLAT', riskPremium: 0, reason: '特段の材料なし' }
    };

    news.forEach((item: NewsItem) => {
      if (item.marketImpact && item.marketImpact.asset) {
        const assetKey = item.marketImpact.asset;
        if (marketImpacts[assetKey] !== undefined) {
          const match = item.marketImpact.predictedChange.match(/([+-]?\d+(?:\.\d+)?)/);
          if (match) {
            const val = parseFloat(match[1]);
            marketImpacts[assetKey].riskPremium += val;
            
            if (Math.abs(val) >= 1.5 || marketImpacts[assetKey].reason === '特段の材料なし') {
              marketImpacts[assetKey].reason = item.title;
            }
          }
        }
      }
    });

    for (const key of Object.keys(marketImpacts)) {
      const premium = marketImpacts[key].riskPremium;
      if (premium > 0.5) {
        marketImpacts[key].direction = 'UP';
      } else if (premium < -0.5) {
        marketImpacts[key].direction = 'DOWN';
      } else {
        marketImpacts[key].direction = 'FLAT';
      }
    }

    // === PROCESS C: MORNING SIGNAL LOG GENERATION (past 7:00 AM local time) ===
    const tokyoOffset = 9 * 60; 
    const systemOffset = new Date().getTimezoneOffset(); 
    const localTokyoTime = new Date(Date.now() + (tokyoOffset + systemOffset) * 60000);
    const year = localTokyoTime.getFullYear();
    const month = String(localTokyoTime.getMonth() + 1).padStart(2, '0');
    const day = String(localTokyoTime.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const hour = localTokyoTime.getHours();

    let todaySummaryJson = null;
    const existingSummary = db.prepare('SELECT * FROM daily_summaries WHERE date = ?').get(dateStr);

    if (existingSummary) {
      todaySummaryJson = JSON.parse(existingSummary.summary_data);
    } else if (hour >= 7) {
      const geopolNews = news.filter(n => n.genre === 'geopolitics');
      const macroNews = news.filter(n => n.genre === 'macro');

      todaySummaryJson = {
        date: dateStr,
        timestamp: Math.floor(Date.now() / 1000),
        signals: {
          BTC: {
            direction: marketImpacts.BTC.direction,
            strength: Math.abs(marketImpacts.BTC.riskPremium) > 3.0 ? 'STRONG' : 'MEDIUM',
            reason: marketImpacts.BTC.reason,
            risk_premium: `${marketImpacts.BTC.riskPremium.toFixed(1)}%`
          },
          USD_JPY: {
            direction: marketImpacts.USD_JPY.direction,
            strength: Math.abs(marketImpacts.USD_JPY.riskPremium) > 2.0 ? 'STRONG' : 'MEDIUM',
            reason: marketImpacts.USD_JPY.reason,
            risk_premium: `${marketImpacts.USD_JPY.riskPremium.toFixed(1)}%`
          },
          Crude_Oil: {
            direction: marketImpacts.Crude_Oil.direction,
            strength: Math.abs(marketImpacts.Crude_Oil.riskPremium) > 4.0 ? 'STRONG' : 'MEDIUM',
            reason: marketImpacts.Crude_Oil.reason,
            risk_premium: `${marketImpacts.Crude_Oil.riskPremium.toFixed(1)}%`
          },
          Gold: {
            direction: marketImpacts.Gold.direction,
            strength: Math.abs(marketImpacts.Gold.riskPremium) > 2.5 ? 'STRONG' : 'MEDIUM',
            reason: marketImpacts.Gold.reason,
            risk_premium: `${marketImpacts.Gold.riskPremium.toFixed(1)}%`
          },
          SP500: {
            direction: marketImpacts.SP500.direction,
            strength: Math.abs(marketImpacts.SP500.riskPremium) > 1.5 ? 'STRONG' : 'MEDIUM',
            reason: marketImpacts.SP500.reason,
            risk_premium: `${marketImpacts.SP500.riskPremium.toFixed(1)}%`
          }
        },
        geopolitical_risk_index: geopolNews.length > 10 ? 8.5 : 5.0,
        geopolitical_summary: geopolNews.slice(0, 3).map(n => n.title).join(' / ') || '地政学リスクに重大な急変は見られません。',
        macro_summary: macroNews.slice(0, 3).map(n => n.title).join(' / ') || 'マクロ金融指標に急激な変動は見られません。'
      };

      try {
        db.prepare('INSERT OR REPLACE INTO daily_summaries (date, summary_data, created_at) VALUES (?, ?, ?)')
          .run(dateStr, JSON.stringify(todaySummaryJson), Math.floor(Date.now() / 1000));
        await saveDailySummaryToNAS(dateStr, todaySummaryJson);
      } catch (err: any) {
        console.error('Failed to save daily summary to DB/NAS:', err.message);
      }
    }

    let latestDailySummary = null;
    if (todaySummaryJson) {
      latestDailySummary = todaySummaryJson;
    } else {
      const row = db.prepare('SELECT * FROM daily_summaries ORDER BY date DESC LIMIT 1').get();
      if (row) {
        latestDailySummary = JSON.parse(row.summary_data);
      }
    }

    // === PROCESS A: EVALUATION (10-MINUTE RESOLUTION) ===
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
      
      if (diff > 0) {
        actualDirection = 'UP';
      } else if (diff < 0) {
        actualDirection = 'DOWN';
      }

      const isCorrect = pred.predicted_direction === actualDirection;
      const accuracyScore = isCorrect ? 1.0 : 0.0;

      updatePredictionStmt.run(currentPrice, accuracyScore, now, pred.id);

      let biasInfo = selectBiasStmt.get(pred.target) as any;
      if (!biasInfo) {
        biasInfo = { target: pred.target, bias_offset: 0.0, total_predictions: 0, correct_predictions: 0 };
      }

      let newBiasOffset = biasInfo.bias_offset;
      if (isCorrect) {
        newBiasOffset *= 0.9;
      } else {
        if (pred.predicted_direction === 'UP' && actualDirection !== 'UP') {
          newBiasOffset -= 0.05;
        } else if (pred.predicted_direction === 'DOWN' && actualDirection !== 'DOWN') {
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

    for (const [target, price] of Object.entries(currentPrices)) {
      const activePending = db.prepare('SELECT COUNT(*) as count FROM predictions WHERE target = ? AND status = \'PENDING\'').get(target) as any;
      
      if (activePending.count > 0 && !fastMode) {
        continue;
      }

      const biasInfo = selectBiasStmt.get(target) as any || { bias_offset: 0.0 };
      let forecast: { direction: 'UP' | 'DOWN' | 'FLAT'; reason: string };

      try {
        if (geminiApiKey) {
          forecast = await askGeminiForecast(target, price, biasInfo.bias_offset, geminiApiKey, news);
        } else {
          forecast = localModelForecast(target, price, biasInfo.bias_offset, news);
        }
      } catch (err: any) {
        console.warn(`Forecast generation failed for ${target} using Gemini. Falling back to local: ${err.message}`);
        forecast = localModelForecast(target, price, biasInfo.bias_offset, news);
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

    const earthquakes = await fetchEarthquakes();

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
      changes_24h: changes24h,
      earthquakes: earthquakes,
      stats: stats,
      recent_predictions: recentPredictions,
      news: news,
      market_impacts: marketImpacts,
      daily_summary: latestDailySummary
    });
  } catch (error: any) {
    console.error('API Error inside /api/forecast:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
