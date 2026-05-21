import fs from 'fs';
import path from 'path';
import type { JapanBoundTankerRecord } from '@/lib/maritime/types';

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

export interface JapanBoundTankerNasLogResult {
  enabled: boolean;
  saved: boolean;
  savedCount: number;
  lastSavedAt: string | null;
  mode: 'local-nas' | 'disabled' | 'unavailable';
  skippedReason?: string;
}

function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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

    const row = headers.map(h => escapeCsvValue((logData as any)[h])).join(',');

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

/**
 * ホルムズ海峡を通過する日本向けエネルギー船の推定記録をNASに保存する。
 * Phase 1ではモック/AIS風推定データなので、保存失敗時もAPIレスポンスは止めない。
 */
export async function saveJapanBoundTankerRecordsToNAS(
  records: JapanBoundTankerRecord[],
  timestamp: number = Date.now()
): Promise<JapanBoundTankerNasLogResult> {
  const enabled = process.env.JAPAN_BOUND_TANKER_NAS_LOG_ENABLED === 'true';
  if (!enabled) {
    return {
      enabled: false,
      saved: false,
      savedCount: 0,
      lastSavedAt: null,
      mode: 'disabled',
      skippedReason: 'disabled_by_env',
    };
  }

  const nasRoot = path.parse(NAS_BASE_PATH).root || NAS_BASE_PATH;
  const directory = path.join(/* turbopackIgnore: true */ NAS_BASE_PATH, 'hormuz', 'japan_bound_tankers');

  if (records.length === 0) {
    return {
      enabled: true,
      saved: false,
      savedCount: 0,
      lastSavedAt: null,
      mode: 'local-nas',
      skippedReason: 'no_records',
    };
  }

  if (!fs.existsSync(/* turbopackIgnore: true */ nasRoot)) {
    return {
      enabled: true,
      saved: false,
      savedCount: 0,
      lastSavedAt: null,
      mode: 'unavailable',
      skippedReason: 'nas_drive_unavailable',
    };
  }

  try {
    if (!fs.existsSync(/* turbopackIgnore: true */ directory)) {
      fs.mkdirSync(/* turbopackIgnore: true */ directory, { recursive: true });
    }

    const snapshotTime = new Date(timestamp);
    const intervalSeconds = Math.max(
      1,
      Number.parseInt(process.env.JAPAN_BOUND_TANKER_NAS_LOG_INTERVAL_SECONDS || '60', 10) || 60
    );
    const bucketMs = Math.floor(timestamp / (intervalSeconds * 1000)) * intervalSeconds * 1000;
    const bucketTime = new Date(bucketMs);
    const dateKey = snapshotTime.toISOString().slice(0, 10);
    const minuteIso = bucketTime.toISOString().slice(0, 16);
    const minuteKey = minuteIso.replace(/[-:T]/g, '');
    const snapshot = {
      timestamp: snapshotTime.toISOString(),
      snapshotMinute: minuteIso,
      source: 'Hormuz Sentinel Mode Phase 1',
      safetyLabel:
        'SIMULATED / ESTIMATED: 日本向けエネルギー船監視記録。実航行・実物流・投資判断には使用しないでください。',
      records,
    };

    const latestJsonPath = path.join(/* turbopackIgnore: true */ directory, 'latest_japan_bound_tankers.json');
    fs.writeFileSync(/* turbopackIgnore: true */ latestJsonPath, JSON.stringify(snapshot, null, 2), 'utf8');

    const snapshotJsonPath = path.join(/* turbopackIgnore: true */ directory, `${dateKey}_${minuteKey}.json`);
    fs.writeFileSync(/* turbopackIgnore: true */ snapshotJsonPath, JSON.stringify(snapshot, null, 2), 'utf8');

    const csvPath = path.join(/* turbopackIgnore: true */ directory, `${dateKey}_summary.csv`);
    const dedupeDir = path.join(/* turbopackIgnore: true */ directory, '_csv_dedupe');
    if (!fs.existsSync(/* turbopackIgnore: true */ dedupeDir)) {
      fs.mkdirSync(/* turbopackIgnore: true */ dedupeDir, { recursive: true });
    }
    const headers = [
      'snapshotMinute',
      'timestamp',
      'recordId',
      'vesselId',
      'vesselName',
      'vesselType',
      'originCountry',
      'loadingPort',
      'cargoForJapan',
      'destinationPort',
      'destinationRegion',
      'hormuzPassageStatus',
      'estimatedHormuzPassedAt',
      'voyageConfidence',
      'currentLat',
      'currentLng',
      'speed',
      'heading',
      'isMock',
    ];
    const hasHeader = fs.existsSync(/* turbopackIgnore: true */ csvPath);

    const lines = records
      .filter((record) => {
        const markerName = `${dateKey}_${minuteKey}_${record.vesselId}_${record.hormuzPassageStatus}.marker`;
        const markerPath = path.join(/* turbopackIgnore: true */ dedupeDir, markerName);
        if (fs.existsSync(/* turbopackIgnore: true */ markerPath)) return false;
        fs.writeFileSync(/* turbopackIgnore: true */ markerPath, snapshot.timestamp, 'utf8');
        return true;
      })
      .map((record) => {
        const row: Record<string, unknown> = {
          snapshotMinute: minuteIso,
          timestamp: snapshot.timestamp,
          ...record,
        };
        return headers.map((header) => escapeCsvValue(row[header])).join(',');
      });

    if (lines.length > 0) {
      const csvContent = `${hasHeader ? '' : `${headers.join(',')}\n`}${lines.join('\n')}\n`;
      fs.appendFileSync(/* turbopackIgnore: true */ csvPath, csvContent, 'utf8');
    }

    console.log(`[NAS] Saved ${records.length} Japan-bound Hormuz tanker records`);
    return {
      enabled: true,
      saved: true,
      savedCount: records.length,
      lastSavedAt: snapshot.timestamp,
      mode: 'local-nas',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown NAS write error';
    console.error(`[NAS] Failed to save Japan-bound Hormuz tanker records:`, message);
    return {
      enabled: true,
      saved: false,
      savedCount: 0,
      lastSavedAt: null,
      mode: 'unavailable',
      skippedReason: 'nas_write_failed',
    };
  }
}

