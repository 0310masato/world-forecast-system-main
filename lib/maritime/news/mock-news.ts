import { GeopoliticalNews } from '../types';

export function getMockNews(timestamp: number = Date.now()): GeopoliticalNews[] {
  // Return static mock items with timestamps offset from the current time
  return [
    {
      id: 'news_01',
      title: '[SIMULATED] ホルムズ海峡北部における通信機器テストと演習予告',
      summary: '(SIMULATED SCENARIO) 地域当局による通信網・レーダー点検のため、海峡北部において数日間の巡回演習が予定されています。周辺航行船舶に対し、通常速度での運航維持およびAISの確実な送出が要請されています。本内容はシミュレーションデータです。',
      source: 'Mock Scenario Feed',
      sourceType: 'MOCK',
      verificationStatus: 'SIMULATED',
      confidence: 'MEDIUM',
      timestamp: new Date(timestamp - 1000 * 60 * 45).toISOString(), // 45m ago
      categories: ['REGIONAL_MILITARY'],
      actors: ['Iran'],
      alertLevel: 'GUARDED',
      cautionLabel: 'DEMO / MOCK SCENARIO: この情報は訓練目的のシミュレーションです。',
      location: { lat: 27.14, lng: 56.22, name: 'バンダレ・アッバース沖' },
    },
    {
      id: 'news_02',
      title: '[SIMULATED] 湾岸諸国の給油ポート混雑率上昇、エネルギー輸送に一時的遅延の推定',
      summary: '(SIMULATED SCENARIO) フジャイラおよび周辺給油泊地において、タンカー等の停泊隻数が平均を上回っており、給油順番待ちが半日〜1日程度遅延している模様です。地域的な海事アナリストによれば、海運ルート全体の原油フローに対する物理的な影響は軽微とされています。本内容はデモデータです。',
      source: 'Simulated Maritime News',
      sourceType: 'MOCK',
      verificationStatus: 'SIMULATED',
      confidence: 'MEDIUM',
      timestamp: new Date(timestamp - 1000 * 60 * 180).toISOString(), // 3 hours ago
      categories: ['ENERGY_SECURITY'],
      actors: ['UAE', 'Saudi Arabia'],
      alertLevel: 'LOW',
      cautionLabel: 'DEMO / MOCK SCENARIO: 実際のタンカー稼働状況を示すものではありません。',
      location: { lat: 25.18, lng: 56.38, name: 'フジャイラ周辺泊地' },
    },
    {
      id: 'news_03',
      title: '[SIMULATED] 最狭部付近におけるAIS信号の一時的受信不良と位置ジャンプの報告',
      summary: '(SIMULATED SCENARIO) 航行安全監視局の仮定シナリオに基づき、ホルムズ海峡最狭部において複数船舶のAIS受信データに一時的な位置ズレおよび欠損が発生している想定です。現地電波干渉、受信アレイの機器調整、または大気状態の影響が疑われています。本内容はシミュレーションです。',
      source: 'Demo Geopolitical Feed',
      sourceType: 'MOCK',
      verificationStatus: 'SIMULATED',
      confidence: 'MEDIUM',
      timestamp: new Date(timestamp - 1000 * 60 * 300).toISOString(), // 5 hours ago
      categories: ['MARITIME_INCIDENT'],
      actors: ['US', 'Iran'],
      alertLevel: 'ELEVATED',
      cautionLabel: 'DEMO / MOCK SCENARIO: 実際のGPS障害や妨害の発生情報ではありません。',
      location: { lat: 26.58, lng: 56.42, name: 'ホルムズ海峡最狭部' },
    },
    {
      id: 'news_04',
      title: '[SIMULATED] ホルムズ周辺海域におけるエネルギー保険プレミアムの評価アップデート',
      summary: '(SIMULATED SCENARIO) ロンドン海事保険ブローカーのデモシナリオ想定に基づき、中東周辺の地政学的緊張（模擬）の上昇を受けて、一部の戦時危険保険料率が一時的に微増したと仮定します。ただし現時点で実物流に具体的な支障は確認されていません。本内容はシミュレーションです。',
      source: 'Simulated Maritime News',
      sourceType: 'MOCK',
      verificationStatus: 'SIMULATED',
      confidence: 'MEDIUM',
      timestamp: new Date(timestamp - 1000 * 60 * 720).toISOString(), // 12 hours ago
      categories: ['ENERGY_SECURITY', 'US_IRAN'],
      actors: ['US', 'Iran', 'Saudi Arabia'],
      alertLevel: 'GUARDED',
      cautionLabel: 'DEMO / MOCK SCENARIO: 金融・投資判断に使用しないでください。',
      location: null,
    },
    {
      id: 'news_05',
      title: '[SIMULATED] 領海緩衝地帯周辺における定期警備および監視ドローンの巡回報告',
      summary: '(SIMULATED SCENARIO) アブームーサー島周辺の海空域において、地域治安当局の警備艇および無人航空機による定期的な巡回警備訓練が観測されたという想定ニュースです。周辺航行ルートから一定の距離が確保されており、安全運航への直接影響はありません。本内容はシミュレーションです。',
      source: 'Demo Geopolitical Feed',
      sourceType: 'MOCK',
      verificationStatus: 'SIMULATED',
      confidence: 'MEDIUM',
      timestamp: new Date(timestamp - 1000 * 60 * 1440).toISOString(), // 24 hours ago
      categories: ['REGIONAL_MILITARY'],
      actors: ['Iran', 'UAE'],
      alertLevel: 'GUARDED',
      cautionLabel: 'DEMO / MOCK SCENARIO: 軍事・防衛判断に使用しないでください。',
      location: { lat: 25.87, lng: 55.04, name: 'アブームーサー島周辺' },
    },
  ];
}
