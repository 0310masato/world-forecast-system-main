import { NewsCategory } from '../types';

interface ClassificationResult {
  categories: NewsCategory[];
  actors: string[];
}

export function classifyNews(title: string, summary: string): ClassificationResult {
  const textToScan = `${title} ${summary}`.toLowerCase();
  
  const categoryKeywords: { cat: NewsCategory; kw: string[] }[] = [
    {
      cat: 'US_IRAN',
      kw: [
        'us',
        'usa',
        'america',
        'iran',
        'tehran',
        'irgc',
        'sanctions',
        '制裁',
        '米国',
        'アメリカ',
        'イラン',
        'テヘラン',
        '革命防衛隊',
      ],
    },
    {
      cat: 'REGIONAL_MILITARY',
      kw: [
        'military',
        'exercise',
        'patrol',
        'navy',
        'army',
        'drone',
        'missile',
        'drill',
        'guard',
        'corps',
        '警備',
        '演習',
        '防衛',
        '訓練',
        '軍事',
        '海軍',
        'ドローン',
        'ミサイル',
        '哨戒',
      ],
    },
    {
      cat: 'MARITIME_INCIDENT',
      kw: [
        'ais',
        'collision',
        'seizure',
        'pirate',
        'spoofing',
        'jump',
        'delay',
        'missing',
        'failure',
        'malfunction',
        '衝突',
        '拿捕',
        '異常',
        '欠損',
        'スプーフィング',
        'ジャンプ',
        '遅延',
        '障害',
        '不良',
      ],
    },
    {
      cat: 'ENERGY_SECURITY',
      kw: [
        'oil',
        'gas',
        'lng',
        'lpg',
        'tanker',
        'crude',
        'insurance',
        'premium',
        'barrel',
        'petroleum',
        '原油',
        '石油',
        'ガス',
        '液化',
        'タンカー',
        '保険',
        'プレミアム',
        'バレル',
      ],
    },
  ];

  const actorKeywords: { actor: string; kw: string[] }[] = [
    { actor: 'US', kw: ['us', 'usa', 'america', 'pentagon', 'white house', '米国', 'アメリカ', '国防総省', 'ホワイトハウス'] },
    { actor: 'Iran', kw: ['iran', 'tehran', 'irgc', 'khamenei', 'イラン', 'テヘラン', '革命防衛隊', 'ハメネイ'] },
    { actor: 'Saudi Arabia', kw: ['saudi', 'riyadh', 'aramco', 'サウジ', 'リヤド', 'アラムコ'] },
    { actor: 'UAE', kw: ['uae', 'emirates', 'fujairah', 'dubai', 'abu dhabi', '首長国連邦', 'フジャイラ', 'ドバイ', 'アブダビ'] },
    { actor: 'Houthi', kw: ['houthi', 'yemen', 'sanaa', 'フーシ', 'イエメン', 'サナア'] },
  ];

  const categories: NewsCategory[] = [];
  categoryKeywords.forEach(({ cat, kw }) => {
    const hasMatch = kw.some((word) => textToScan.includes(word));
    if (hasMatch) {
      categories.push(cat);
    }
  });

  if (categories.length === 0) {
    categories.push('OTHER');
  }

  const actors: string[] = [];
  actorKeywords.forEach(({ actor, kw }) => {
    const hasMatch = kw.some((word) => textToScan.includes(word));
    if (hasMatch) {
      actors.push(actor);
    }
  });

  return {
    categories,
    actors,
  };
}
