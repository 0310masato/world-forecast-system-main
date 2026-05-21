import fs from 'fs';
import path from 'path';

const NAS_BASE_PATH = 'A:\\world_forecast_logs';

export interface NASLogData {
  id: number;
  target: string;
  predicted_direction: 'UP' | 'DOWN' | 'FLAT';
  prediction_price: number;
  prediction_time: number;
  target_time: number;
  actual_price: number | null;
  status: 'PENDING' | 'RESOLVED';
  accuracy_score: number | null;
  evaluation_time: number | null;
  reason: string | null;
  bias_offset: number;
}

/**
 * 予測・検証データをNASに永続化保存する
 */
export async function saveLogToNAS(logData: NASLogData): Promise<boolean> {
  try {
    // 1. NAS ディレクトリの存在確認と作成
    if (!fs.existsSync(NAS_BASE_PATH)) {
      try {
        fs.mkdirSync(NAS_BASE_PATH, { recursive: true });
      } catch (dirError: any) {
        console.error(`[NAS] Failed to create base directory at ${NAS_BASE_PATH}:`, dirError.message);
        return false; // A:ドライブ未マウントなどのケース
      }
    }

    // 2. CSVへの追記 (summary.csv)
    const csvPath = path.join(NAS_BASE_PATH, 'summary.csv');
    const hasHeader = fs.existsSync(csvPath);
    
    // CSVヘッダーとデータの構築
    const headers = [
      'id', 'target', 'predicted_direction', 'prediction_price', 
      'prediction_time', 'target_time', 'actual_price', 'status', 
      'accuracy_score', 'evaluation_time', 'reason', 'bias_offset'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const row = headers.map(h => escapeCsv((logData as any)[h])).join(',');

    let csvContent = '';
    if (!hasHeader) {
      csvContent += headers.join(',') + '\n';
    }
    csvContent += row + '\n';

    fs.appendFileSync(csvPath, csvContent, 'utf8');

    // 3. 詳細JSONの個別保存
    const jsonFileName = `forecast_${logData.target}_${logData.id}_${logData.evaluation_time || Math.floor(Date.now() / 1000)}.json`;
    const jsonPath = path.join(NAS_BASE_PATH, jsonFileName);
    fs.writeFileSync(jsonPath, JSON.stringify(logData, null, 2), 'utf8');

    console.log(`[NAS] Successfully saved prediction ID ${logData.id} to NAS (${NAS_BASE_PATH})`);
    return true;
  } catch (error: any) {
    // NASが未接続やオフラインの場合の堅牢なエラーハンドリング
    console.error(`[NAS] Error writing to A: drive (NAS offline or sleep):`, error.message);
    return false;
  }
}

/**
 * 朝のシグナル集約サマリーをNASに保存する
 */
export async function saveDailySummaryToNAS(dateStr: string, summaryData: any): Promise<boolean> {
  try {
    const dailyDir = path.join(NAS_BASE_PATH, 'daily_summaries');
    if (!fs.existsSync(dailyDir)) {
      try {
        fs.mkdirSync(dailyDir, { recursive: true });
      } catch (dirError: any) {
        console.error(`[NAS] Failed to create daily summaries directory at ${dailyDir}:`, dirError.message);
        return false;
      }
    }
    const jsonPath = path.join(dailyDir, `daily_summary_${dateStr}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(summaryData, null, 2), 'utf8');
    console.log(`[NAS] Successfully saved daily summary for ${dateStr} to NAS (${jsonPath})`);
    return true;
  } catch (error: any) {
    console.error(`[NAS] Error writing daily summary to A: drive (NAS offline or sleep):`, error.message);
    return false;
  }
}

