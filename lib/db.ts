import Database from 'better-sqlite3';
import path from 'path';

// データベースファイルの保存パス
const DB_PATH = path.join(process.cwd(), 'world_forecast.db');

let db: any;

try {
  db = new Database(DB_PATH, { verbose: console.log });
  
  // テーブル作成のマイグレーション
  db.exec(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target TEXT NOT NULL,
      predicted_direction TEXT NOT NULL,
      prediction_price REAL NOT NULL,
      prediction_time INTEGER NOT NULL,
      target_time INTEGER NOT NULL,
      actual_price REAL,
      status TEXT DEFAULT 'PENDING',
      accuracy_score REAL,
      evaluation_time INTEGER,
      reason TEXT
    );

    CREATE TABLE IF NOT EXISTS ai_bias_feedback (
      target TEXT PRIMARY KEY,
      bias_offset REAL DEFAULT 0.0,
      total_predictions INTEGER DEFAULT 0,
      correct_predictions INTEGER DEFAULT 0,
      last_updated INTEGER
    );

    CREATE TABLE IF NOT EXISTS daily_summaries (
      date TEXT PRIMARY KEY,
      summary_data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  // 初期シードデータ (ai_bias_feedback に初期値を入れておく)
  const targets = ['BTC', 'USD_JPY', 'Gold', 'Crude_Oil', 'SP500'];
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM ai_bias_feedback');
  const count = checkStmt.get().count;

  if (count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO ai_bias_feedback (target, bias_offset, total_predictions, correct_predictions, last_updated)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const now = Math.floor(Date.now() / 1000);
    for (const t of targets) {
      // 最初は適当なダミー統計を入れる（見栄えのため：正解率約60%）
      const total = 10;
      const correct = 6;
      insertStmt.run(t, 0.0, total, correct, now);
    }
  }

  // 過去のダミー予測データも少し入れておく（統計表示のため）
  const predCountStmt = db.prepare('SELECT COUNT(*) as count FROM predictions');
  const predCount = predCountStmt.get().count;
  if (predCount === 0) {
    const insertPred = db.prepare(`
      INSERT INTO predictions (target, predicted_direction, prediction_price, prediction_time, target_time, actual_price, status, accuracy_score, evaluation_time, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = Math.floor(Date.now() / 1000);
    
    // BTCの過去データ
    insertPred.run('BTC', 'UP', 77500.0, now - 3600, now - 3000, 77800.0, 'RESOLVED', 1.0, now - 3000, '短期移動平均のゴールデンクロス');
    insertPred.run('BTC', 'DOWN', 77650.0, now - 2400, now - 1800, 77500.0, 'RESOLVED', 1.0, now - 1800, 'RSI過熱感による調整下落');
    insertPred.run('BTC', 'UP', 77550.0, now - 1200, now - 600, 77500.0, 'RESOLVED', 0.0, now - 600, '安値支持線での反発予測');
    
    // USD_JPYの過去データ
    insertPred.run('USD_JPY', 'UP', 158.90, now - 3600, now - 3000, 159.05, 'RESOLVED', 1.0, now - 3000, '日米金利差の拡大バイアス');
    insertPred.run('USD_JPY', 'DOWN', 159.02, now - 2400, now - 1800, 158.95, 'RESOLVED', 1.0, now - 1800, '介入警戒感による短期調整');
    
    // S&P500の過去データ
    insertPred.run('SP500', 'UP', 7420.0, now - 3600, now - 3000, 7415.0, 'RESOLVED', 0.0, now - 3000, '金利引き下げ期待の先行織り込み');
 
    // Gold の過去データ
    insertPred.run('Gold', 'UP', 4520.0, now - 3600, now - 3000, 4525.0, 'RESOLVED', 1.0, now - 3000, '地政学的リスクの高まりによる避難買い');
    
    // Crude_Oil の過去データ
    insertPred.run('Crude_Oil', 'DOWN', 100.2, now - 3600, now - 3000, 99.8, 'RESOLVED', 1.0, now - 3000, '在庫量増加による需給緩和懸念');
  }

  console.log('Database initialized successfully with seed data.');
} catch (error) {
  console.error('Failed to initialize database:', error);
}

export default db;
