"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from './Dashboard.module.css';
import * as d3 from 'd3';

// Globe.gl import (safe due to dynamic import on page level)
import Globe from 'react-globe.gl';
import HormuzSentinelView from './HormuzSentinelView';

// Asset coordinate mappings
const ASSETS_COORDS: Record<string, { lat: number, lng: number, label: string, name: string }> = {
  BTC: { lat: 51.5074, lng: -0.1278, label: 'ロンドン (BTCノード)', name: 'ビットコイン' },
  USD_JPY: { lat: 35.6762, lng: 139.6503, label: '東京 (ドル円)', name: 'ドル円' },
  SP500: { lat: 40.7128, lng: -74.0060, label: 'ニューヨーク (S&P500)', name: 'S&P500' },
  Crude_Oil: { lat: 24.7136, lng: 46.6753, label: 'リヤド (原油)', name: '原油価格' },
  Gold: { lat: -26.2041, lng: 28.0473, label: 'ヨハネスブルグ (金)', name: '金' }
};

const GENRE_MAP: Record<'macro' | 'geopolitics' | 'commodity' | 'local', { label: string, color: string, bg: string }> = {
  macro: { label: 'マクロ経済', color: '#00ff66', bg: 'rgba(0,255,102,0.1)' },
  geopolitics: { label: '地政学リスク', color: '#ff3366', bg: 'rgba(255,51,102,0.1)' },
  commodity: { label: 'エネルギー・商品', color: '#ffcc00', bg: 'rgba(255,204,0,0.1)' },
  local: { label: 'ローカル情報', color: '#00ccff', bg: 'rgba(0,204,255,0.1)' }
};

interface FinancialEvent {
  date: string;
  time: string;
  country: string;
  countryCode: 'US' | 'JP' | 'EU' | 'CN' | 'UK';
  event: string;
  importance: 'high' | 'medium' | 'low';
  previous: string;
  forecast: string;
  actual: string;
}

const getFinancialEvents = (baseDate: Date): FinancialEvent[] => {
  const formatDate = (daysOffset: number) => {
    const d = new Date(baseDate.getTime());
    d.setDate(d.getDate() + daysOffset);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };

  return [
    { date: formatDate(-2), time: '21:30', country: '米国', countryCode: 'US', event: '米消費者物価指数 (CPI) [前月比]', importance: 'high', previous: '0.4%', forecast: '0.3%', actual: '0.3%' },
    { date: formatDate(-2), time: '21:30', country: '米国', countryCode: 'US', event: '米消費者物価指数 (CPI) [前年同月比]', importance: 'high', previous: '3.5%', forecast: '3.4%', actual: '3.4%' },
    { date: formatDate(-1), time: '08:50', country: '日本', countryCode: 'JP', event: '日本貿易収支 (通関ベース)', importance: 'medium', previous: '-3600億円', forecast: '-2500億円', actual: '-2100億円' },
    { date: formatDate(-1), time: '20:00', country: '英国', countryCode: 'UK', event: '英イングランド銀行 (BOE) 政策金利発表', importance: 'high', previous: '5.25%', forecast: '5.25%', actual: '5.25%' },
    { date: formatDate(0), time: '08:30', country: '日本', countryCode: 'JP', event: '全国消費者物価指数 (CPI) [生鮮除く総合・前年比]', importance: 'high', previous: '2.6%', forecast: '2.5%', actual: '2.5%' },
    { date: formatDate(0), time: '16:30', country: 'ドイツ (欧州)', countryCode: 'EU', event: '独製造業購買担当者景気指数 (PMI) 速報値', importance: 'medium', previous: '42.5', forecast: '43.1', actual: '43.5' },
    { date: formatDate(0), time: '21:30', country: '米国', countryCode: 'US', event: '米新規失業保険申請件数', importance: 'medium', previous: '22.0万件', forecast: '21.8万件', actual: '21.5万件' },
    { date: formatDate(1), time: '10:45', country: '中国', countryCode: 'CN', event: '中財新製造業PMI', importance: 'medium', previous: '50.6', forecast: '50.8', actual: '未発表' },
    { date: formatDate(1), time: '21:30', country: '米国', countryCode: 'US', event: '米雇用統計 (非農業部門雇用者数変化)', importance: 'high', previous: '17.5万人', forecast: '18.0万人', actual: '未発表' },
    { date: formatDate(1), time: '21:30', country: '米国', countryCode: 'US', event: '米雇用統計 (失業率)', importance: 'high', previous: '3.9%', forecast: '3.8%', actual: '未発表' },
    { date: formatDate(2), time: '18:00', country: 'ユーロ圏', countryCode: 'EU', event: '欧州消費者物価指数 (HICP) 速報値', importance: 'high', previous: '2.4%', forecast: '2.4%', actual: '未発表' },
    { date: formatDate(3), time: '08:50', country: '日本', countryCode: 'JP', event: '日銀・金融政策決定会合 議事要旨公表', importance: 'medium', previous: '---', forecast: '---', actual: '未発表' },
    { date: formatDate(4), time: '23:00', country: '米国', countryCode: 'US', event: '米ISM非製造業景況指数', importance: 'high', previous: '51.4', forecast: '52.0', actual: '未発表' },
    { date: formatDate(5), time: '14:00', country: '日本', countryCode: 'JP', event: '景気動向指数・速報値', importance: 'low', previous: '112.2', forecast: '113.0', actual: '未発表' },
    { date: formatDate(6), time: '21:30', country: '米国', countryCode: 'US', event: '米実質GDP (改定値) [前期比年率]', importance: 'high', previous: '1.6%', forecast: '1.8%', actual: '未発表' }
  ];
};

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  relatedAsset?: string;
  lat: number;
  lng: number;
  genre: 'macro' | 'geopolitics' | 'commodity' | 'local';
  region: 'north_america' | 'asia_japan' | 'europe' | 'middle_east' | 'other';
  summary?: string[];
  marketImpact?: {
    asset: string;
    direction: 'UP' | 'DOWN' | 'FLAT';
    impactDegree: 'L' | 'M' | 'H' | 'VH';
    predictedChange: string;
  };
}

const getImpactScore = (item: NewsItem): number => {
  let base = 30; // default M
  if (item.marketImpact) {
    const deg = item.marketImpact.impactDegree;
    if (deg === 'L') base = 3;
    else if (deg === 'M') base = 15;
    else if (deg === 'H') base = 50;
    else if (deg === 'VH') base = 100;
  } else {
    if (item.genre === 'geopolitics') base = 40;
    else if (item.genre === 'macro') base = 30;
    else if (item.genre === 'commodity') base = 25;
    else base = 10;
  }
  const hash = item.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const varFactor = (hash % 5) - 2; // -2 to +2
  return Math.max(1, Math.min(100, base + varFactor));
};

interface ForecastItem {
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
}

interface BiasStat {
  target: string;
  bias_offset: number;
  total_predictions: number;
  correct_predictions: number;
}

interface EarthquakeItem {
  id: string;
  mag: number;
  place: string;
  time: number;
  lat: number;
  lng: number;
}

function GlitchCounter({ value, className }: { value: string; className?: string }) {
  const [displayVal, setDisplayVal] = useState(value);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (value !== displayVal) {
      setIsGlitching(true);
      const timer = setTimeout(() => {
        setIsGlitching(false);
        setDisplayVal(value);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [value, displayVal]);

  return (
    <span className={`${className || ''} ${isGlitching ? styles.textGlitch : ''}`}>
      {isGlitching ? displayVal : value}
    </span>
  );
}

export default function Dashboard() {
  // Navigation & View layout states
  const [activeView, setActiveView] = useState<'split' | '3d' | '2d' | 'hormuz'>('split');
  const [selectedTarget, setSelectedTarget] = useState<string>('BTC');
  const [isBottomMonitorExpanded, setIsBottomMonitorExpanded] = useState<boolean>(false);
  const [fastMode, setFastMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // API Data States
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [changes24h, setChanges24h] = useState<Record<string, number>>({});
  const [newsGlitch, setNewsGlitch] = useState<boolean>(false);
  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);
  const [stats, setStats] = useState<BiasStat[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<ForecastItem[]>([]);
  const [evaluatedLogs, setEvaluatedLogs] = useState<string[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketImpacts, setMarketImpacts] = useState<Record<string, { direction: 'UP' | 'DOWN' | 'FLAT'; riskPremium: number; reason: string }>>({});
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'news' | 'events'>('news');
  const [panelWidth, setPanelWidth] = useState<number>(320);
  const [panelHeight, setPanelHeight] = useState<number>(680);
  const [dragType, setDragType] = useState<'width' | 'height' | 'both' | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'width' | 'height' | 'both') => {
    e.preventDefault();
    setDragType(type);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: panelWidth,
      startHeight: panelHeight
    };
  }, [panelWidth, panelHeight]);

  useEffect(() => {
    if (!dragType) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      if (dragType === 'width' || dragType === 'both') {
        const deltaX = dragRef.current.startX - e.clientX;
        let newWidth = dragRef.current.startWidth + deltaX;

        // 1. Min-width: 300px
        if (newWidth < 300) {
          newWidth = 300;
        }
        
        // 2. Max-width: 50% of viewport width
        const maxWidth = window.innerWidth * 0.5;
        if (newWidth > maxWidth) {
          newWidth = maxWidth;
        }

        setPanelWidth(newWidth);
      }

      if (dragType === 'height' || dragType === 'both') {
        const deltaY = e.clientY - dragRef.current.startY;
        let newHeight = dragRef.current.startHeight + deltaY;

        // Min-height: 400px
        if (newHeight < 400) {
          newHeight = 400;
        }

        // Max-height: 90% of viewport height (or window.innerHeight - 80)
        const maxHeight = window.innerHeight - 80;
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
        }

        setPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setDragType(null);
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragType]);

  const panelExpanded = panelWidth > 480;
  const [activeLayers, setActiveLayers] = useState<Record<'macro' | 'geopolitics' | 'commodity' | 'local', boolean>>({
    macro: true,
    geopolitics: true,
    commodity: true,
    local: true
  });
  const [selectedEventCountry, setSelectedEventCountry] = useState<'all' | 'US' | 'JP' | 'EU' | 'CN' | 'UK'>('all');

  // Filtering & Interaction States
  const [activeGenreFilter, setActiveGenreFilter] = useState<'all' | 'macro' | 'geopolitics' | 'commodity' | 'local'>('all');
  const [activeRegionFilter, setActiveRegionFilter] = useState<'all' | 'north_america' | 'asia_japan' | 'europe' | 'middle_east' | 'other'>('all');
  const [hoveredNewsTitle, setHoveredNewsTitle] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [globePoints, setGlobePoints] = useState<(NewsItem & { targetAltitude: number; altitude: number })[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // D3 World GeoJSON State
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Timers & Countdown States
  const [countdown, setCountdown] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Refs
  const globeRef = useRef<any>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const mapSvgRef = useRef<SVGSVGElement>(null);
  const logConsoleRef = useRef<HTMLDivElement>(null);

  // Globe dimensions state
  const [globeSize, setGlobeSize] = useState({ width: 600, height: 400 });

  // Update globe size on resize/view toggles
  useEffect(() => {
    const handleResize = () => {
      if (globeContainerRef.current) {
        setGlobeSize({
          width: globeContainerRef.current.clientWidth,
          height: globeContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [activeView]);

  // Fetch forecast data and statistics
  const fetchData = async (isTrigger = false) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const url = `/api/forecast?fast=${fastMode}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setCurrentPrices(data.current_prices);
        setChanges24h(data.changes_24h || {});
        setEarthquakes(data.earthquakes);
        setStats(data.stats);
        setRecentPredictions(data.recent_predictions);
        
        if (data.news) {
          setNews(data.news);
        }
        if (data.market_impacts) {
          setMarketImpacts(data.market_impacts);
        }
        if (data.daily_summary) {
          setDailySummary(data.daily_summary);
        }
        
        if (data.evaluated_logs && data.evaluated_logs.length > 0) {
          setEvaluatedLogs(prev => [
            ...data.evaluated_logs.map((log: string) => `[${new Date().toLocaleTimeString()}] ${log}`),
            ...prev
          ].slice(0, 100)); // Cap logs at 100 entries
        }

        // Set countdown to next target time
        const pending = data.recent_predictions.find((p: ForecastItem) => p.status === 'PENDING');
        if (pending) {
          const timeLeft = pending.target_time - Math.floor(Date.now() / 1000);
          setCountdown(timeLeft > 0 ? timeLeft : 0);
        } else {
          setCountdown(fastMode ? 60 : 600);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  // Fetch D3 GeoJSON World Map Data on mount
  useEffect(() => {
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(err => {
        console.error('Failed to load world map GeoJSON:', err);
      });
    
    // Initial fetch
    fetchData();

    // Console logs initialization
    setEvaluatedLogs([
      `[${new Date().toLocaleTimeString()}] システム正常稼働中。監視データベースに接続しました。`,
      `[${new Date().toLocaleTimeString()}] 3D Globe および 2D World Map の同期エンジンがロードされました。`
    ]);
  }, []);

  // Fullscreen management logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Filtered news memo
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchGenre = activeGenreFilter === 'all' || item.genre === activeGenreFilter;
      const matchRegion = activeRegionFilter === 'all' || item.region === activeRegionFilter;
      return matchGenre && matchRegion;
    });
  }, [news, activeGenreFilter, activeRegionFilter]);

  // Handle globe points altitude transition for grow animation
  useEffect(() => {
    const activePoints = filteredNews.filter(item => activeLayers[item.genre]);
    
    // Map items to target altitudes based on market impact using logarithmic scale
    const preparedPoints = activePoints.map(item => {
      const score = getImpactScore(item);
      const targetAlt = 0.03 + 0.145 * Math.log(1 + score);
      return {
        ...item,
        targetAltitude: targetAlt,
        altitude: 0.01 // start close to 0 for growth animation
      };
    });

    setGlobePoints(preparedPoints);

    // Animate to target altitudes
    const timer = setTimeout(() => {
      setGlobePoints(prev => 
        prev.map(p => ({ ...p, altitude: p.targetAltitude }))
      );
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredNews, activeLayers]);

  const financialEvents = useMemo(() => getFinancialEvents(new Date()), []);
  const filteredEvents = useMemo(() => {
    if (selectedEventCountry === 'all') return financialEvents;
    return financialEvents.filter(e => e.countryCode === selectedEventCountry);
  }, [financialEvents, selectedEventCountry]);

  // Next.js Dev Tools / Dev Overlay Translation Hook
  useEffect(() => {
    const translationMap: Record<string, string> = {
      "Preferences": "環境設定",
      "Theme": "テーマ",
      "Select your theme preference.": "テーマの好みを選択します。",
      "System": "システム",
      "Light": "ライト",
      "Dark": "ダーク",
      "Position": "表示位置",
      "Adjust the placement of your dev tools.": "開発ツールの表示位置を調整します。",
      "Bottom Left": "左下",
      "Bottom Right": "右下",
      "Top Left": "左上",
      "Top Right": "右上",
      "Size": "サイズ",
      "Adjust the size of your dev tools.": "開発ツールのサイズを調整します。",
      "Small": "小",
      "Medium": "中",
      "Large": "大",
      "Hide Dev Tools for this session": "このセッションで非表示にする",
      "Hide Dev Tools until you restart your dev server, or 1 day.": "開発サーバーを再起動するか、1日経過するまで開発ツールを非表示にします。",
      "Hide": "非表示にする",
      "Hide Dev Tools shortcut": "非表示ショートカット",
      "Set a custom keyboard shortcut to toggle visibility.": "表示を切り替えるカスタムショートカットキーを設定します。",
      "Record Shortcut": "ショートカットを記録",
      "Disable Dev Tools for this project": "このプロジェクトで無効化",
      "Restart Dev Server": "開発サーバーの再起動",
      "Restarts the development server without needing to leave the browser.": "ブラウザを閉じることなく、開発サーバーを再起動します。",
      "Restart": "再起動",
      "Reset Bundler Cache": "バンドルキャッシュのリセット",
      "Clears the bundler cache and restarts the dev server. Helpful if you are seeing stale errors or changes are not appearing.": "バンドラキャッシュをクリアし、開発サーバーを再起動します。古いエラーが消えない場合や、変更が画面に反映されない場合に有効です。",
      "Reset Cache": "キャッシュリセット"
    };

    const translateNode = (node: Node) => {
      const element = node as Element;
      
      // Handle the project disable warning with code elements and order-swap safely at the element level
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        if (element.tagName === 'P' || element.tagName === 'DIV' || element.tagName === 'SPAN') {
          const hasDisableText = element.textContent?.includes("To disable this UI completely");
          const hasCodeChildren = Array.from(element.children).some(child => child.tagName === 'CODE');
          if (hasDisableText && hasCodeChildren) {
            Array.from(element.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                const val = child.nodeValue || "";
                if (val.includes("To disable this UI completely, set")) {
                  child.nodeValue = "このUIを完全に無効化するには、";
                } else if (val.includes("in your")) {
                  child.nodeValue = " を ";
                } else if (val.includes("file")) {
                  child.nodeValue = " ファイルに設定してください。";
                }
              }
            });
            return;
          }
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const trimmed = node.nodeValue?.trim() || "";
        if (trimmed && translationMap[trimmed]) {
          node.nodeValue = translationMap[trimmed];
        }
      } else {
        if (element.shadowRoot) {
          translateNode(element.shadowRoot);
        }
        const children = Array.from(node.childNodes);
        children.forEach(child => translateNode(child));
      }
    };

    const translatePortal = (portal: Element) => {
      const htmlPortal = portal as HTMLElement;
      if (htmlPortal && !htmlPortal.dataset.propagationStopped) {
        const stopPropagation = (e: Event) => {
          e.stopPropagation();
        };
        const events = ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup'];
        events.forEach(eventName => {
          htmlPortal.addEventListener(eventName, stopPropagation);
        });
        htmlPortal.dataset.propagationStopped = "true";
      }

      if (portal.shadowRoot) {
        translateNode(portal.shadowRoot);
        if (!htmlPortal.dataset.shadowObserved) {
          const shadowObserver = new MutationObserver(() => {
            if (portal.shadowRoot) translateNode(portal.shadowRoot);
          });
          shadowObserver.observe(portal.shadowRoot, { childList: true, subtree: true, characterData: true });
          htmlPortal.dataset.shadowObserved = "true";
        }
      }
    };

    // First translate any existing ones
    document.querySelectorAll('nextjs-portal').forEach(translatePortal);

    // Observe document.body for newly added portals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.tagName.toLowerCase() === 'nextjs-portal') {
              translatePortal(el);
            } else {
              el.querySelectorAll('nextjs-portal').forEach(translatePortal);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Poll prices and update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Trigger evaluation and next forecast when countdown hits 0
          fetchData();
          return fastMode ? 60 : 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fastMode]);

  // Periodic API polling (every 30 seconds for price updates)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [fastMode]);

  // News update glitch trigger
  useEffect(() => {
    if (news.length > 0) {
      setNewsGlitch(true);
      const timer = setTimeout(() => setNewsGlitch(false), 300);
      return () => clearTimeout(timer);
    }
  }, [news]);

  // Format price helper
  const formatPrice = (symbol: string, val: number | undefined) => {
    if (val === undefined) return '---';
    if (symbol === 'BTC') return `$${val.toLocaleString()}`;
    if (symbol === 'USD_JPY') return `¥${val.toFixed(2)}`;
    if (symbol === 'Gold') return `$${val.toLocaleString()}`;
    if (symbol === 'Crude_Oil') return `$${val.toFixed(2)}`;
    if (symbol === 'SP500') return val.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return val.toString();
  };

  // Globe.gl Data Mappings
  const labelData = useMemo(() => {
    return Object.entries(ASSETS_COORDS).map(([symbol, coords]) => {
      const price = currentPrices[symbol];
      const pendingPred = recentPredictions.find(p => p.target === symbol && p.status === 'PENDING');
      const arrow = pendingPred 
        ? (pendingPred.predicted_direction === 'UP' ? '▲' : pendingPred.predicted_direction === 'DOWN' ? '▼' : '▶')
        : '';
      const color = pendingPred
        ? (pendingPred.predicted_direction === 'UP' ? '#10b981' : pendingPred.predicted_direction === 'DOWN' ? '#f43f5e' : '#06b6d4')
        : '#9ca3af';

      return {
        lat: coords.lat,
        lng: coords.lng,
        text: `${coords.name}\n${formatPrice(symbol, price)} ${arrow}`,
        color,
        size: selectedTarget === symbol ? 1.8 : 1.2,
        symbol
      };
    });
  }, [currentPrices, recentPredictions, selectedTarget]);

  const ringsData = useMemo(() => {
    return earthquakes.map(eq => ({
      lat: eq.lat,
      lng: eq.lng,
      maxR: eq.mag * 2.5,
      propagationSpeed: 1.5,
      color: eq.mag > 5.0 ? 'rgba(244, 63, 94, 0.8)' : (eq.mag > 3.0 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(6, 182, 212, 0.5)')
    }));
  }, [earthquakes]);

  const allLabelsData = useMemo(() => {
    // Start with asset labels only
    return labelData.map(d => ({ ...d, type: 'asset', altitude: 0.01 }));
  }, [labelData]);

  const htmlElementsData = useMemo(() => {
    const list: any[] = [];
    globePoints.forEach(item => {
      const isHovered = item.title === hoveredNewsTitle;
      const isSelected = selectedNews?.title === item.title;
      if (isHovered || isSelected) {
        list.push({
          ...item,
          // float slightly above the top of the pillar
          altitude: (item.altitude || 0.01) + 0.05
        });
      }
    });
    return list;
  }, [globePoints, hoveredNewsTitle, selectedNews]);

  const renderHtmlElement = useCallback((d: any) => {
    const el = document.createElement('div');
    const color = GENRE_MAP[d.genre as keyof typeof GENRE_MAP]?.color || '#ffffff';
    
    // Style container
    el.style.width = 'fit-content';
    el.style.minWidth = '240px';
    el.style.maxWidth = '420px';
    el.style.height = 'auto';
    el.style.padding = '16px';
    el.style.background = 'rgba(15, 23, 42, 0.85)';
    el.style.backdropFilter = 'blur(12px)';
    el.style.setProperty('-webkit-backdrop-filter', 'blur(12px)');
    el.style.border = `1.5px solid ${color}`;
    el.style.borderRadius = '8px';
    el.style.boxShadow = `0 0 15px ${color}`;
    el.style.color = '#ffffff';
    el.style.fontFamily = 'var(--font-mono, monospace)';
    el.style.fontSize = '12px';
    el.style.whiteSpace = 'normal';
    el.style.pointerEvents = 'none';
    el.style.transition = 'opacity 150ms ease';
    el.style.boxSizing = 'border-box';
    
    // Center alignment adjustment since react-globe positions center-center:
    // We want the bottom center of the tooltip to be above the point, so we translate:
    el.style.transform = 'translate(-50%, -100%)';
    el.style.marginTop = '-10px';
    
    const summaryHtml = d.summary && d.summary.length > 0 
      ? `<div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.15); font-size:11px; line-height:1.5; color:rgba(255,255,255,0.85); text-align:left;">${d.summary.map((s: string) => `• ${s}`).join('<br/>')}</div>`
      : '';
      
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:10px; opacity:0.8; width:100%;">
        <span style="color:${color}; font-weight:bold; text-transform:uppercase;">${GENRE_MAP[d.genre as keyof typeof GENRE_MAP]?.label || d.genre}</span>
        <span>${d.source}</span>
      </div>
      <div style="font-weight:bold; font-size:13px; line-height:1.4; text-align:left; width:100%;">${d.title}</div>
      ${summaryHtml}
    `;
    
    return el;
  }, []);

  // Adjust globe POV when selectedTarget changes
  useEffect(() => {
    if (globeRef.current && selectedTarget && ASSETS_COORDS[selectedTarget]) {
      const targetCoords = ASSETS_COORDS[selectedTarget];
      globeRef.current.pointOfView({
        lat: targetCoords.lat - 15, // Look slightly below the pin
        lng: targetCoords.lng,
        altitude: 1.6
      }, 1000); // 1 sec smooth transition
    }
  }, [selectedTarget]);

  // SVG 2D D3 Map Drawing
  useEffect(() => {
    if (!geoJsonData || !mapSvgRef.current) return;

    const svg = d3.select(mapSvgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    // Register linear gradients for the pillars
    const defs = svg.append('defs');
    (Object.keys(GENRE_MAP) as Array<keyof typeof GENRE_MAP>).forEach(genre => {
      const color = GENRE_MAP[genre].color;
      const grad = defs.append('linearGradient')
        .attr('id', `pillar-grad-${genre}`)
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');
        
      grad.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.2);
        
      grad.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.85);
    });

    const width = mapSvgRef.current.clientWidth || 800;
    const height = mapSvgRef.current.clientHeight || 400;

    // Define Projection (Mercator)
    const projection = d3.geoMercator()
      .scale(Math.min(width / 6.2, height / 2.6))
      .translate([width / 2, height / 1.7]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Retrieve current zoom transform (if any) to prevent resetting zoom on data updates
    const currentTransform = d3.zoomTransform(mapSvgRef.current);
    const g = svg.append('g')
      .attr('class', 'map-g')
      .attr('transform', currentTransform.toString());

    // Select the HTML tooltip element
    const parentNode = mapSvgRef.current.parentNode as HTMLElement | null;
    const tooltip = parentNode ? d3.select(parentNode).select<HTMLElement>('.map-2d-tooltip') : null;

    // Find the currently active news item for the tooltip
    let activeItem = filteredNews.find(item => item.title === hoveredNewsTitle && activeLayers[item.genre]);
    if (!activeItem && selectedNews && activeLayers[selectedNews.genre]) {
      activeItem = filteredNews.find(item => item.title === selectedNews.title);
    }

    // Define Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        
        // Update active tooltip position during zoom
        if (activeItem && tooltip) {
          const proj = projection([activeItem.lng, activeItem.lat]);
          if (proj) {
            const [cx, cy] = proj;
            const score = getImpactScore(activeItem);
            const h = 5 + 22.8 * Math.log(1 + score);
            const screenX = event.transform.applyX(cx);
            const screenY = event.transform.applyY(cy - h);
            tooltip
              .style('left', `${screenX}px`)
              .style('top', `${screenY - 20}px`);
          }
        }
      });

    svg.call(zoom as any);

    // Draw Countries
    const mapG = g.append('g').attr('class', 'countries');
    
    mapG.selectAll('path')
      .data(geoJsonData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('fill', '#070716')
      .attr('stroke', 'rgba(99, 102, 241, 0.12)')
      .attr('stroke-width', '1px')
      .on('mouseover', function() {
        d3.select(this)
          .attr('fill', 'rgba(99, 102, 241, 0.08)')
          .attr('stroke', 'rgba(99, 102, 241, 0.35)');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill', '#070716')
          .attr('stroke', 'rgba(99, 102, 241, 0.12)');
      });

    // Draw Earthquake Rings (USGS)
    const eqG = g.append('g').attr('class', 'earthquakes');
    earthquakes.forEach(eq => {
      const coords = projection([eq.lng, eq.lat]);
      if (!coords) return;

      const [cx, cy] = coords;
      const color = eq.mag > 5.0 ? '#f43f5e' : (eq.mag > 3.0 ? '#f59e0b' : '#06b6d4');

      // Outer animated ring
      const ring = eqG.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 2)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1)
        .attr('opacity', 0.8);

      ring.transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('r', eq.mag * 3.5)
        .attr('opacity', 0)
        .on('end', function repeat() {
          d3.select(this)
            .attr('r', 2)
            .attr('opacity', 0.8)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('r', eq.mag * 3.5)
            .attr('opacity', 0)
            .on('end', repeat);
        });

      // Core point
      eqG.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', Math.max(2, eq.mag * 0.8))
        .attr('fill', color)
        .attr('opacity', 0.6)
        .append('title')
        .text(`地震: ${eq.place}\nM: ${eq.mag}`);
    });

    // Draw 3D Heat Pillars in D3 (Optimized with datum binding)
    const pillarsG = g.append('g').attr('class', 'news-pillars');
    filteredNews.forEach(item => {
      if (!activeLayers[item.genre]) return;
      const proj = projection([item.lng, item.lat]);
      if (!proj) return;
      
      const [cx, cy] = proj;
      const isSelected = selectedNews?.title === item.title;
      
      // Determine cylinder height based on market impact using logarithmic scale
      const score = getImpactScore(item);
      const h = 5 + 22.8 * Math.log(1 + score);
      
      const w = 8; // Cylinder width
      const r = w / 2;
      const color = GENRE_MAP[item.genre]?.color || '#ffffff';
      
      // Group for the pillar
      const pillarGroup = pillarsG.append('g')
        .datum(item) // Bind data
        .attr('class', 'news-pillar')
        .style('cursor', 'pointer')
        .on('mouseover', () => {
          setHoveredNewsTitle(item.title);
        })
        .on('mouseout', () => {
          setHoveredNewsTitle(null);
        })
        .on('click', () => {
          setSelectedNews(item);
          if (item.relatedAsset) {
            setSelectedTarget(item.relatedAsset);
          }
        });

      // Opacity based on initial state (no news is hovered yet)
      const opacity = isSelected ? 1.0 : 0.75;

      // 1. Bottom base (ellipse)
      pillarGroup.append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', r)
        .attr('ry', r / 3.5)
        .attr('fill', color)
        .attr('opacity', opacity * 0.5);

      // 2. Cylinder body (rect)
      const glowRadius = Math.max(3, Math.min(20, (score / 100) * 15 + 2));

      const body = pillarGroup.append('rect')
        .attr('x', cx - r)
        .attr('y', cy)
        .attr('width', w)
        .attr('height', 0)
        .attr('fill', `url(#pillar-grad-${item.genre})`)
        .attr('opacity', opacity)
        .style('filter', isSelected ? `drop-shadow(0 0 ${glowRadius}px ${color})` : `drop-shadow(0 0 2px ${color})`);

      body.transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('y', cy - h)
        .attr('height', h);

      // 3. Top cap (ellipse)
      const topCap = pillarGroup.append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', r)
        .attr('ry', r / 3.5)
        .attr('fill', color)
        .attr('opacity', opacity)
        .style('filter', isSelected ? `drop-shadow(0 0 ${glowRadius}px ${color})` : `drop-shadow(0 0 2px ${color})`);

      topCap.transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('cy', cy - h);

      // 3.5 White core cap (LED effect)
      const topCapCore = pillarGroup.append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', r * 0.6)
        .attr('ry', (r * 0.6) / 3.5)
        .attr('fill', '#ffffff')
        .attr('opacity', opacity);

      topCapCore.transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('cy', cy - h);

    });

    // Draw Asset Pins
    const pinG = g.append('g').attr('class', 'assets');
    
    Object.entries(ASSETS_COORDS).forEach(([symbol, coords]) => {
      const projected = projection([coords.lng, coords.lat]);
      if (!projected) return;
      const [cx, cy] = projected;

      const isSelected = selectedTarget === symbol;
      const pendingPred = recentPredictions.find(p => p.target === symbol && p.status === 'PENDING');
      
      const pinColor = pendingPred
        ? (pendingPred.predicted_direction === 'UP' ? '#10b981' : pendingPred.predicted_direction === 'DOWN' ? '#f43f5e' : '#06b6d4')
        : '#a5b4fc';

      // Pin glow ring
      pinG.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', isSelected ? 12 : 7)
        .attr('fill', 'none')
        .attr('stroke', pinColor)
        .attr('stroke-width', 1.5)
        .attr('opacity', isSelected ? 0.7 : 0.3)
        .style('filter', `drop-shadow(0 0 4px ${pinColor})`);

      // Pin center dot
      pinG.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', isSelected ? 5 : 3.5)
        .attr('fill', pinColor)
        .on('click', () => {
          setSelectedTarget(symbol);
        })
        .style('cursor', 'pointer');

      // Pin text label
      pinG.append('text')
        .attr('x', cx + 10)
        .attr('y', cy + 4)
        .text(symbol)
        .attr('fill', isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)')
        .attr('font-size', isSelected ? '0.75rem' : '0.65rem')
        .attr('font-weight', isSelected ? '700' : '400')
        .attr('font-family', 'monospace')
        .on('click', () => {
          setSelectedTarget(symbol);
        })
        .style('cursor', 'pointer');
    });

    // D3 programmatic zoom/pan transition to selected news
    if (selectedNews && mapSvgRef.current) {
      const projected = projection([selectedNews.lng, selectedNews.lat]);
      if (projected) {
        const [cx, cy] = projected;
        const scale = 3;
        const tx = width / 2 - cx * scale;
        const ty = height / 2 - cy * scale;
        
        svg.transition()
          .duration(1000)
          .call(
            zoom.transform as any,
            d3.zoomIdentity.translate(tx, ty).scale(scale)
          );
      }
    }

  }, [geoJsonData, earthquakes, selectedTarget, recentPredictions, filteredNews, selectedNews, activeLayers]);

  // SVG 2D D3 Map Hover & Tooltip Updates (Optimized, no redraw)
  useEffect(() => {
    if (!geoJsonData || !mapSvgRef.current) return;
    
    const svg = d3.select(mapSvgRef.current);
    const parentNode = mapSvgRef.current.parentNode as HTMLElement | null;
    const tooltip = parentNode ? d3.select(parentNode).select<HTMLElement>('.map-2d-tooltip') : null;

    // 1. Update news pillars opacity based on hover state
    const pillars = svg.selectAll('.news-pillar');
    const hasHoveredActive = hoveredNewsTitle !== null;

    pillars.each(function(d: any) {
      if (!d) return;
      const isHovered = d.title === hoveredNewsTitle;
      const isSelected = selectedNews?.title === d.title;
      
      let opacity = 0.75;
      if (isHovered || isSelected) {
        opacity = 1.0;
      } else if (hasHoveredActive) {
        opacity = 0.08;
      }

      const group = d3.select(this);
      const color = GENRE_MAP[d.genre as keyof typeof GENRE_MAP]?.color || '#ffffff';
      const score = getImpactScore(d);
      const glowRadius = Math.max(3, Math.min(20, (score / 100) * 15 + 2));

      // Update bottom base ellipse opacity
      group.select('ellipse').style('opacity', opacity * 0.5);

      // Update body rect
      group.selectAll('rect')
        .style('opacity', opacity)
        .style('filter', isHovered || isSelected ? `drop-shadow(0 0 ${glowRadius}px ${color})` : `drop-shadow(0 0 2px ${color})`);

      // Update ellipses: index 0 = base, index 1 = top cap, index 2 = white core cap
      group.selectAll('ellipse')
        .each(function(_, index) {
          const ell = d3.select(this);
          if (index === 0) {
            ell.style('opacity', opacity * 0.5);
          } else if (index === 1) {
            ell.style('opacity', opacity)
               .style('filter', isHovered || isSelected ? `drop-shadow(0 0 ${glowRadius}px ${color})` : `drop-shadow(0 0 2px ${color})`);
          } else if (index === 2) {
            ell.style('opacity', opacity);
          }
        });
    });

    // 2. Update HTML tooltip position and content
    let activeItem = filteredNews.find(item => item.title === hoveredNewsTitle && activeLayers[item.genre]);
    if (!activeItem && selectedNews && activeLayers[selectedNews.genre]) {
      activeItem = filteredNews.find(item => item.title === selectedNews.title);
    }

    if (activeItem && tooltip) {
      const width = mapSvgRef.current.clientWidth || 800;
      const height = mapSvgRef.current.clientHeight || 400;
      
      const projection = d3.geoMercator()
        .scale(Math.min(width / 6.2, height / 2.6))
        .translate([width / 2, height / 1.7]);

      const proj = projection([activeItem.lng, activeItem.lat]);
      if (proj) {
        const [cx, cy] = proj;
        const score = getImpactScore(activeItem);
        const h = 5 + 22.8 * Math.log(1 + score);
        
        const currentTransform = d3.zoomTransform(mapSvgRef.current);
        const screenX = currentTransform.applyX(cx);
        const screenY = currentTransform.applyY(cy - h);
        
        const color = GENRE_MAP[activeItem.genre]?.color || '#ffffff';
        const summaryHtml = activeItem.summary && activeItem.summary.length > 0 
          ? `<div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.15); font-size:11px; line-height:1.5; color:rgba(255,255,255,0.85); text-align:left; width:100%;">${activeItem.summary.map((s: string) => `• ${s}`).join('<br/>')}</div>`
          : '';

        tooltip
          .style('left', `${screenX}px`)
          .style('top', `${screenY - 20}px`)
          .style('opacity', 1)
          .html(`
            <div style="
              width: fit-content;
              min-width: 240px;
              max-width: 420px;
              height: auto;
              padding: 16px;
              background: rgba(15, 23, 42, 0.85);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              border: 1.5px solid ${color};
              border-radius: 8px;
              box-shadow: 0 0 15px ${color};
              color: #ffffff;
              font-family: var(--font-mono, monospace);
              font-size: 12px;
              white-space: normal;
              box-sizing: border-box;
            ">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:10px; opacity:0.8; width:100%; gap:16px;">
                <span style="color:${color}; font-weight:bold; text-transform:uppercase;">${GENRE_MAP[activeItem.genre]?.label || activeItem.genre}</span>
                <span>${activeItem.source}</span>
              </div>
              <div style="font-weight:bold; font-size:13px; line-height:1.4; text-align:left; width:100%;">${activeItem.title}</div>
              ${summaryHtml}
            </div>
          `);
      }
    } else if (tooltip) {
      tooltip.style('opacity', 0);
    }
  }, [hoveredNewsTitle, selectedNews, filteredNews, activeLayers, geoJsonData]);

  // Scroll log terminal to top when new logs arrive
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = 0;
    }
  }, [evaluatedLogs]);

  // Calculation of display stats for target cards
  const cardStats = useMemo(() => {
    return Object.keys(ASSETS_COORDS).map(symbol => {
      const price = currentPrices[symbol];
      const targetStat = stats.find(s => s.target === symbol) || { bias_offset: 0.0, total_predictions: 1, correct_predictions: 0 };
      const pendingPred = recentPredictions.find(p => p.target === symbol && p.status === 'PENDING');
      
      const accuracy = targetStat.total_predictions > 0
        ? ((targetStat.correct_predictions / targetStat.total_predictions) * 100).toFixed(1)
        : '0.0';

      const change24h = changes24h[symbol] || 0.0;

      const premium = Math.abs(marketImpacts[symbol]?.riskPremium || 0);
      let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'STABLE' = 'STABLE';
      if (premium > 4.0) riskLevel = 'CRITICAL';
      else if (premium > 2.0) riskLevel = 'HIGH';
      else if (premium > 0.5) riskLevel = 'MEDIUM';
      else if (premium > 0) riskLevel = 'LOW';

      return {
        symbol,
        name: ASSETS_COORDS[symbol].name,
        price,
        change24h,
        riskLevel,
        direction: pendingPred?.predicted_direction || 'FLAT',
        reason: pendingPred?.reason || 'レンジ均衡状態',
        accuracy,
        bias: targetStat.bias_offset,
      };
    });
  }, [currentPrices, stats, recentPredictions, changes24h, marketImpacts]);

  // Selected item details for the bottom monitor
  const selectedDetails = useMemo(() => {
    return cardStats.find(s => s.symbol === selectedTarget) || null;
  }, [cardStats, selectedTarget]);

  // Secret data bridge text for Gemini in Chrome
  const secretBridgeText = useMemo(() => {
    const priceText = Object.entries(currentPrices)
      .map(([sym, price]) => `${sym}: ${price}`)
      .join(', ');
      
    const biasText = stats
      .map(s => `${s.target} (Bias: ${s.bias_offset.toFixed(4)}, Accuracy: ${((s.correct_predictions / (s.total_predictions || 1)) * 100).toFixed(1)}%)`)
      .join(', ');

    const predictionsText = recentPredictions
      .slice(0, 10)
      .map(p => `[${p.status}] Target: ${p.target}, Predicted: ${p.predicted_direction}, Price: ${p.prediction_price}, TargetTime: ${p.target_time}, Reason: ${p.reason || 'N/A'}, ActualPrice: ${p.actual_price || 'N/A'}`)
      .join('\n');

    const newsText = news
      .map(n => `[News] Source: ${n.source} | Title: ${n.title} | Genre: ${n.genre} | Summary: ${n.summary?.join('; ') || 'None'} | Impact: ${n.marketImpact ? `${n.marketImpact.asset} ${n.marketImpact.direction} (${n.marketImpact.predictedChange})` : 'None'} | Coords: ${n.lat}, ${n.lng}`)
      .join('\n');

    const eqText = earthquakes
      .slice(0, 5)
      .map(eq => `[Earthquake] Mag: ${eq.mag} | Place: ${eq.place} | Coords: ${eq.lat}, ${eq.lng}`)
      .join('\n');

    return `
=== SYSTEM STATE REPORT ===
Time: ${new Date().toISOString()}

--- CURRENT PRICES ---
${priceText}

--- AI STATS & BIAS CORRECTION ---
${biasText}

--- RECENT FORECASTS ---
${predictionsText}

--- LIVE WORLD NEWS ---
${newsText}

--- RECENT EARTHQUAKES ---
${eqText}
==========================
    `.trim();
  }, [currentPrices, stats, recentPredictions, news, earthquakes]);

  // Regional Impact Data aggregation
  const regionalImpactData = useMemo(() => {
    const baselines = {
      north_america: 85.4,
      asia_japan: 42.1,
      europe: 98.9,
      middle_east: 64.2
    };
    
    const sums = {
      north_america: 0,
      asia_japan: 0,
      europe: 0,
      middle_east: 0
    };
    
    const counts = {
      north_america: 0,
      asia_japan: 0,
      europe: 0,
      middle_east: 0
    };

    news.forEach(item => {
      const region = item.region;
      if (region in sums) {
        sums[region as keyof typeof sums] += getImpactScore(item);
        counts[region as keyof typeof counts] += 1;
      }
    });

    return Object.keys(baselines).map(key => {
      const regionKey = key as keyof typeof baselines;
      const val = counts[regionKey] > 0 ? (sums[regionKey] / counts[regionKey]) : baselines[regionKey];
      return {
        region: regionKey,
        label: regionKey === 'north_america' ? '北米' : regionKey === 'asia_japan' ? 'アジア' : regionKey === 'europe' ? '欧州' : '中東',
        value: Math.max(10, Math.min(100, val))
      };
    });
  }, [news]);

  // Volatility Forecast Sparkline points
  const volatilityForecastPoints = useMemo(() => {
    const seedPrice = currentPrices[selectedTarget] || 100;
    const bias = stats.find(s => s.target === selectedTarget)?.bias_offset || 0;
    
    const numPoints = 20;
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * 100;
      
      const baseFreq = 0.5 + Math.abs(bias) * 0.1;
      const phase = seedPrice % 10;
      const noise = Math.sin(i * baseFreq + phase) * 12 + Math.cos(i * 0.8 - phase) * 6;
      
      const y = 35 + noise + (bias * 15);
      const clampedY = Math.max(5, Math.min(55, 60 - y));
      
      points.push({ x, y: clampedY });
    }
    
    return points;
  }, [selectedTarget, currentPrices, stats]);

  const linePath = useMemo(() => {
    if (volatilityForecastPoints.length === 0) return '';
    return volatilityForecastPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [volatilityForecastPoints]);

  const areaPath = useMemo(() => {
    if (volatilityForecastPoints.length === 0) return '';
    return `${linePath} L 100 60 L 0 60 Z`;
  }, [linePath, volatilityForecastPoints]);

  return (
    <div className={styles.container}>
      {/* HUD overlay elements */}
      <div className={styles.hudScanlines} />
      <div className={styles.hudGridPoints} />
      <div className={`${styles.hudCorner} ${styles.hudCornerTopLeft}`} />
      <div className={`${styles.hudCorner} ${styles.hudCornerTopRight}`} />
      <div className={`${styles.hudCorner} ${styles.hudCornerBottomLeft}`} />
      <div className={`${styles.hudCorner} ${styles.hudCornerBottomRight}`} />

      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>世界予想システム</h1>
          <span>AI Real-Time World Monitor</span>
        </div>
        <div className={styles.controls}>
          {/* Debug Fast Mode toggle */}
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px', fontSize: '0.8rem', gap: '8px' }}>
            <span style={{ color: fastMode ? 'var(--secondary)' : 'var(--text-muted)' }}>
              {fastMode ? '⚙️ 高速判定 (1分モード)' : '⏱️ 通常判定 (10分モード)'}
            </span>
            <input 
              type="checkbox" 
              checked={fastMode}
              onChange={(e) => {
                setFastMode(e.target.checked);
                setCountdown(e.target.checked ? 60 : 600);
              }}
              style={{ cursor: 'pointer', accentColor: 'var(--secondary)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '2px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--secondary)' }}>
            答え合わせまで: {Math.floor(countdown / 60)}分{(countdown % 60).toString().padStart(2, '0')}秒
          </div>

          <button 
            className={styles.btn}
            onClick={() => fetchData(true)}
            disabled={isFetching}
            style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--secondary)' }}
          >
            {isFetching ? '実行中...' : '手動判定&予測'}
          </button>

          <button 
            className={styles.btn}
            onClick={toggleFullscreen}
            style={{ 
              borderColor: isFullscreen ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.4)', 
              color: isFullscreen ? '#f43f5e' : 'var(--secondary)' 
            }}
          >
            {isFullscreen ? '🚪 全画面解除' : '🖥️ 全画面表示'}
          </button>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', margin: '0 4px' }} />

          <button 
            className={`${styles.btn} ${activeView === 'split' ? styles.activeBtn : ''}`}
            onClick={() => setActiveView('split')}
          >
            分割表示
          </button>
          <button 
            className={`${styles.btn} ${activeView === '3d' ? styles.activeBtn : ''}`}
            onClick={() => setActiveView('3d')}
          >
            3D地球儀
          </button>
          <button 
            className={`${styles.btn} ${activeView === '2d' ? styles.activeBtn : ''}`}
            onClick={() => setActiveView('2d')}
          >
            2D地図
          </button>
          <button 
            className={`${styles.btn} ${activeView === 'hormuz' ? styles.activeBtn : ''}`}
            onClick={() => setActiveView('hormuz')}
          >
            ⚓ ホルムズ監視
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.placeholderText} style={{ height: 'calc(100vh - 60px)' }}>
          データソースに接続中...
        </div>
      ) : (
        <main className={styles.content}>
          {activeView === 'hormuz' ? (
            <HormuzSentinelView />
          ) : (
            <>
              {/* Left Panel: Real-Time Grid */}
              <div className={`${styles.floatingLeftPanel} glass-panel`}>
            <h3 className={styles.sectionTitle}>価格予測マトリクス</h3>
            <table className={styles.assetTable}>
              <thead>
                <tr>
                  <th>ASSET_ID</th>
                  <th>CURRENT_VALUE</th>
                  <th>CHANGE_24H</th>
                  <th>RISK_LEVEL</th>
                </tr>
              </thead>
              <tbody>
                {cardStats.map((t) => {
                  const isSelected = selectedTarget === t.symbol;
                  const changeClass = t.change24h > 0 ? styles.changePos : t.change24h < 0 ? styles.changeNeg : styles.changeFlat;
                  const changeText = t.change24h > 0 ? `+${t.change24h.toFixed(2)}%` : `${t.change24h.toFixed(2)}%`;
                  const riskBadgeClass = t.riskLevel === 'CRITICAL' ? styles.riskCritical :
                                         t.riskLevel === 'HIGH' ? styles.riskHigh :
                                         t.riskLevel === 'MEDIUM' ? styles.riskMedium :
                                         t.riskLevel === 'LOW' ? styles.riskLow : styles.riskStable;
                  return (
                    <tr 
                      key={t.symbol} 
                      className={`${styles.assetRow} ${isSelected ? styles.selectedAssetRow : ''}`}
                      onClick={() => setSelectedTarget(t.symbol)}
                    >
                      <td className={styles.assetId}>{t.symbol}</td>
                      <td className={styles.assetValue}>
                        <GlitchCounter value={formatPrice(t.symbol, t.price)} />
                      </td>
                      <td className={changeClass}>
                        {changeText}
                      </td>
                      <td>
                        <span className={`${styles.riskBadge} ${riskBadgeClass}`}>
                          {t.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Volatility Forecast Widget */}
            <div className={styles.volatilityForecast}>
              <div className={styles.volatilityTitle}>
                <span>ボラティリティ推移予測 ({selectedTarget})</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>LIVE</span>
              </div>
              <div className={styles.volatilityChartContainer}>
                <svg className={styles.volatilitySparkline} viewBox="0 0 100 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="volatilityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#volatilityGrad)" />
                  <path d={linePath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Regional Impact Comparison Widget */}
            <div className={styles.widgetContainer}>
              <h4 className={styles.sectionTitle} style={{ fontSize: '0.75rem', marginBottom: '8px', color: 'var(--secondary)' }}>地域別インパクト比較</h4>
              <div className={styles.regionalChart}>
                {regionalImpactData.map((item) => (
                  <div key={item.region} className={styles.regionalBarContainer}>
                    <span className={styles.regionalValue}>{item.value.toFixed(1)}</span>
                    <div className={styles.regionalBarWrapper}>
                      <div 
                        className={styles.regionalBar} 
                        style={{ height: `${item.value}%` }} 
                      />
                    </div>
                    <span className={styles.regionalLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Layer Settings */}
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 className={styles.sectionTitle} style={{ margin: '0 0 10px 0', color: 'var(--secondary)' }}>マップレイヤー設定</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(Object.keys(GENRE_MAP) as Array<keyof typeof GENRE_MAP>).map((key) => {
                  const value = GENRE_MAP[key];
                  return (
                    <label 
                      key={key} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        fontSize: '0.75rem', 
                        color: '#e5e7eb',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.01)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.03)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: value.color,
                          boxShadow: `0 0 6px ${value.color}`
                        }} />
                        <span>{value.label} レイヤー</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={activeLayers[key]}
                        onChange={(e) => {
                          setActiveLayers(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }));
                        }}
                        style={{ 
                          cursor: 'pointer',
                          accentColor: value.color
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Risk Premium & Market Impact */}
            {Object.keys(marketImpacts).length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 className={styles.sectionTitle} style={{ margin: '0 0 10px 0', color: '#ffcc00', borderLeftColor: '#ffcc00' }}>AI相関分析・リスクプレミアム</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(marketImpacts).map(([symbol, imp]) => {
                    const priceCard = cardStats.find(c => c.symbol === symbol);
                    const label = priceCard ? priceCard.name : symbol;
                    return (
                      <div 
                        key={symbol}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          fontSize: '0.72rem', 
                          color: '#e5e7eb',
                          background: 'rgba(255,255,255,0.01)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.03)'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            color: imp.direction === 'UP' ? '#10b981' : imp.direction === 'DOWN' ? '#f43f5e' : '#06b6d4',
                            fontWeight: 700 
                          }}>
                            {imp.direction === 'UP' ? '▲' : imp.direction === 'DOWN' ? '▼' : '▶'}{' '}
                            {imp.riskPremium > 0 ? `+${imp.riskPremium.toFixed(1)}%` : `${imp.riskPremium.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Morning Summary */}
            {dailySummary && (
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 className={styles.sectionTitle} style={{ margin: 0, color: '#ff3366', borderLeftColor: '#ff3366' }}>朝のシグナル集約</h3>
                  <span style={{ fontSize: '0.6rem', color: '#ff3366', background: 'rgba(255,51,102,0.1)', padding: '2px 5px', borderRadius: '4px', border: '1px solid rgba(255,51,102,0.2)' }}>
                    {dailySummary.date}版
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem' }}>
                  <div style={{ color: '#e5e7eb', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>地政学リスク指数: <span style={{ color: '#ff3366' }}>{dailySummary.geopolitical_risk_index}</span></div>
                    <div style={{ lineHeight: '1.3', color: '#9ca3af', fontSize: '0.65rem' }}>
                      {dailySummary.geopolitical_summary}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Tab-switching (Console vs News) */}
          <div 
            className={`${styles.floatingPanel} glass-panel`} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: `${panelWidth}px`,
              height: `${panelHeight}px`,
              maxHeight: 'calc(100vh - 100px)',
              transition: dragType ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Draggable Resizer Handle - Left (Width) */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'width')}
              className={styles.resizerHandleWidth}
            />

            {/* Draggable Resizer Handle - Bottom (Height) */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'height')}
              className={styles.resizerHandleHeight}
            />

            {/* Draggable Resizer Handle - Corner (Both) */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'both')}
              className={styles.resizerHandleCorner}
            />

            <div className={styles.tabHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'console' ? styles.activeTabBtn : ''}`}
                  onClick={() => setActiveTab('console')}
                >
                  AI コンソール
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'news' ? styles.activeTabBtn : ''}`}
                  onClick={() => setActiveTab('news')}
                >
                  最新ニュース
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'events' ? styles.activeTabBtn : ''}`}
                  onClick={() => setActiveTab('events')}
                >
                  金融イベント
                </button>
              </div>
              <button
                onClick={() => {
                  if (panelWidth > 480) {
                    setPanelWidth(320);
                  } else {
                    setPanelWidth(640);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {panelWidth > 480 ? '◀ 縮小' : '↔ 拡張'}
              </button>
            </div>
            
            {activeTab === 'console' && (
              <div 
                ref={logConsoleRef}
                style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  fontSize: '0.75rem', 
                  fontFamily: 'Consolas, Monaco, monospace',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  color: '#a5b4fc',
                  padding: '2px',
                  lineHeight: '1.4'
                }}
              >
                {evaluatedLogs.map((log, i) => {
                  const isError = log.includes('ハズレ');
                  const isSuccess = log.includes('的中');
                  let logColor = '#a5b4fc';
                  if (isError) logColor = '#f43f5e';
                  else if (isSuccess) logColor = '#10b981';

                  return (
                    <div 
                      key={i} 
                      style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.02)', 
                        paddingBottom: '6px',
                        color: logColor
                      }}
                    >
                      <span style={{ color: '#6366f1' }}>&gt;</span> {log}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'news' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
                {/* Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {/* Genre Row */}
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ジャンル</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {[
                        { key: 'all', label: 'すべて' },
                        { key: 'macro', label: 'マクロ経済' },
                        { key: 'geopolitics', label: '地政学リスク' },
                        { key: 'commodity', label: 'エネルギー・商品' },
                        { key: 'local', label: 'ローカル情報' }
                      ].map(g => (
                        <button
                          key={g.key}
                          onClick={() => setActiveGenreFilter(g.key as any)}
                          style={{
                            fontSize: '0.65rem',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: activeGenreFilter === g.key ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                            background: activeGenreFilter === g.key ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.01)',
                            color: activeGenreFilter === g.key ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Region Row */}
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>地域</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {[
                        { key: 'all', label: 'すべて' },
                        { key: 'north_america', label: '北米' },
                        { key: 'asia_japan', label: 'アジア・日本' },
                        { key: 'europe', label: '欧州' },
                        { key: 'middle_east', label: '中東' },
                        { key: 'other', label: 'その他' }
                      ].map(r => (
                        <button
                          key={r.key}
                          onClick={() => setActiveRegionFilter(r.key as any)}
                          style={{
                            fontSize: '0.65rem',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: activeRegionFilter === r.key ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            background: activeRegionFilter === r.key ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.01)',
                            color: activeRegionFilter === r.key ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* News Timeline List */}
                <div 
                  className={`${styles.newsTimeline} ${newsGlitch ? styles.glitchActive : ''}`}
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {filteredNews.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '20px' }}>
                      該当するニュースがありません
                    </div>
                  ) : (
                    filteredNews.map((item, idx) => {
                      const isHovered = item.title === hoveredNewsTitle;
                      return (
                        <div 
                          key={idx}
                          className={styles.newsCard}
                          onMouseEnter={() => setHoveredNewsTitle(item.title)}
                          onMouseLeave={() => setHoveredNewsTitle(null)}
                          onClick={() => {
                            setSelectedNews(item);
                            if (globeRef.current) {
                              globeRef.current.pointOfView({
                                lat: item.lat - 15,
                                lng: item.lng,
                                altitude: 1.6
                              }, 1000);
                            }
                            if (item.relatedAsset) {
                              setSelectedTarget(item.relatedAsset);
                            }
                          }}
                          style={{
                            cursor: 'pointer',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: isHovered ? 'rgba(251, 146, 60, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: isHovered ? '1px solid rgba(251, 146, 60, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.2s ease',
                            boxShadow: isHovered ? '0 0 10px rgba(251, 146, 60, 0.15)' : 'none'
                          }}
                        >
                          <div className={styles.newsMeta} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span className={styles.newsSource} style={{ color: 'var(--secondary)', fontWeight: 600 }}>{item.source}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <span style={{
                                background: GENRE_MAP[item.genre]?.bg || 'rgba(255,255,255,0.1)',
                                color: GENRE_MAP[item.genre]?.color || '#fff',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                fontSize: '0.55rem',
                                border: `1px solid ${GENRE_MAP[item.genre]?.color || 'transparent'}`
                              }}>
                                {GENRE_MAP[item.genre]?.label || item.genre}
                              </span>
                              <span style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#d1d5db',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                fontSize: '0.55rem'
                              }}>
                                {item.region === 'north_america' ? '北米' : item.region === 'asia_japan' ? 'アジア' : item.region === 'europe' ? '欧州' : item.region === 'middle_east' ? '中東' : 'その他'}
                              </span>
                            </div>
                          </div>
                          <div className={styles.newsTitle} style={{ fontSize: '0.78rem', color: '#f3f4f6', fontWeight: 600, lineHeight: 1.35 }}>
                            {item.title}
                          </div>

                          {/* 3-line Japanese summary */}
                          {item.summary && item.summary.length > 0 && (
                            <ul style={{ 
                              margin: '6px 0', 
                              paddingLeft: '14px', 
                              fontSize: '0.68rem', 
                              color: '#9ca3af', 
                              lineHeight: '1.35',
                              listStyleType: 'square'
                            }}>
                              {item.summary.slice(0, 3).map((line, lIdx) => (
                                <li key={lIdx} style={{ marginBottom: '2px' }}>{line}</li>
                              ))}
                            </ul>
                          )}

                          {/* Market Impact badge */}
                          {item.marketImpact && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              marginTop: '6px', 
                              padding: '4px 6px',
                              background: 'rgba(0, 0, 0, 0.25)',
                              borderRadius: '4px',
                              borderLeft: `2px solid ${
                                item.marketImpact.direction === 'UP' 
                                  ? '#10b981' 
                                  : item.marketImpact.direction === 'DOWN' 
                                    ? '#f43f5e' 
                                    : '#06b6d4'
                              }`,
                              fontSize: '0.62rem'
                            }}>
                              <span style={{ color: 'rgba(255,255,255,0.45)' }}>市場影響:</span>
                              <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{item.marketImpact.asset}</span>
                              <span style={{ 
                                color: item.marketImpact.direction === 'UP' 
                                  ? '#10b981' 
                                  : item.marketImpact.direction === 'DOWN' 
                                    ? '#f43f5e' 
                                    : '#06b6d4',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                                影響度:{item.marketImpact.impactDegree === 'VH' ? '極大' : item.marketImpact.impactDegree === 'H' ? '大' : item.marketImpact.impactDegree === 'M' ? '中' : '小'}{' '}
                                {item.marketImpact.direction === 'UP' ? '↑' : item.marketImpact.direction === 'DOWN' ? '↓' : '→'}{' '}
                                ({item.marketImpact.predictedChange})
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.3)', marginTop: '6px' }}>
                            <span>{item.relatedAsset ? `🔗 ${item.relatedAsset}` : ''}</span>
                            <span>📍 {item.lat.toFixed(2)}, {item.lng.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
                {/* Country Filters */}
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>国・地域フィルター</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {[
                      { key: 'all', label: 'すべて' },
                      { key: 'US', label: '米国 🇺🇸' },
                      { key: 'JP', label: '日本 🇯🇵' },
                      { key: 'EU', label: '欧州 🇪🇺' },
                      { key: 'CN', label: '中国 🇨🇳' },
                      { key: 'UK', label: '英国 🇬🇧' }
                    ].map(c => (
                      <button
                        key={c.key}
                        onClick={() => setSelectedEventCountry(c.key as any)}
                        style={{
                          fontSize: '0.65rem',
                          padding: '4px 9px',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: selectedEventCountry === c.key ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                          background: selectedEventCountry === c.key ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.01)',
                          color: selectedEventCountry === c.key ? '#fff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calendar List */}
                <div 
                  className={styles.newsTimeline}
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {filteredEvents.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '20px' }}>
                      該当するイベントがありません
                    </div>
                  ) : (
                    filteredEvents.map((evt, idx) => {
                      const isHigh = evt.importance === 'high';
                      const isMedium = evt.importance === 'medium';
                      const impLabel = isHigh ? '重要度: 高' : isMedium ? '重要度: 中' : '重要度: 低';
                      const impBg = isHigh ? 'rgba(239, 68, 68, 0.12)' : isMedium ? 'rgba(251, 146, 60, 0.12)' : 'rgba(96, 165, 250, 0.12)';
                      const impColor = isHigh ? '#f87171' : isMedium ? '#fb923c' : '#60a5fa';

                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: '600' }}>
                                {evt.date} {evt.time}
                              </span>
                              <span style={{
                                background: 'rgba(255,255,255,0.06)',
                                color: '#e5e7eb',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontSize: '0.6rem'
                              }}>
                                {evt.country}
                              </span>
                            </div>
                            <span style={{
                              background: impBg,
                              color: impColor,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              fontSize: '0.6rem',
                              fontWeight: '600',
                              border: `1px solid ${impColor}22`
                            }}>
                              {impLabel}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#f3f4f6', fontWeight: '500', lineHeight: 1.3, marginBottom: '6px' }}>
                            {evt.event}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.15)', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>前回</div>
                              <div style={{ fontSize: '0.7rem', color: '#d1d5db', fontWeight: '600' }}>{evt.previous}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>予想</div>
                              <div style={{ fontSize: '0.7rem', color: '#d1d5db', fontWeight: '600' }}>{evt.forecast}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>結果</div>
                              <div style={{ 
                                fontSize: '0.7rem', 
                                color: evt.actual === '未発表' ? 'var(--text-muted)' : '#10b981', 
                                fontWeight: '700' 
                              }}>{evt.actual}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Top Half: 3D Globe */}
          <div 
            className={`${styles.topHalf} ${
              activeView === '3d' ? styles.fullHeight : activeView === '2d' ? styles.collapsed : ''
            }`}
            ref={globeContainerRef}
          >
            <div className={styles.globeContainer}>
              {activeView !== '2d' && (
                <Globe
                  ref={globeRef}
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                  backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                  width={globeSize.width}
                  height={globeSize.height}
                  
                  // Render USGS Earthquakes
                  ringsData={ringsData}
                  ringColor={(d: any) => d.color}
                  ringMaxRadius={(d: any) => d.maxR}
                  ringPropagationSpeed={(d: any) => d.propagationSpeed}

                  // Render Asset & Floating News Labels via Labels
                  labelsData={allLabelsData}
                  labelLat={(d: any) => d.lat}
                  labelLng={(d: any) => d.lng}
                  labelText={(d: any) => d.text}
                  labelColor={(d: any) => d.color}
                  labelSize={(d: any) => d.size}
                  labelDotRadius={(d: any) => d.type === 'asset' ? 0.4 : 0}
                  labelResolution={3}
                  labelAltitude={(d: any) => d.altitude || 0.01}
                  onLabelClick={(label: any) => {
                    if (label.type === 'asset' && label.symbol) {
                      setSelectedTarget(label.symbol);
                    }
                  }}

                  // Render Adaptive HTML Tooltips
                  htmlElementsData={htmlElementsData}
                  htmlElement={renderHtmlElement}
                  htmlAltitude={(d: any) => d.altitude}
                  htmlTransitionDuration={150}

                  // Render 3D Heat Pillars via Points
                  pointsData={globePoints}
                  pointLat={(d: any) => d.lat}
                  pointLng={(d: any) => d.lng}
                  pointColor={(d: any) => GENRE_MAP[d.genre as keyof typeof GENRE_MAP]?.color || '#ffffff'}
                  pointAltitude={(d: any) => d.altitude}
                  pointRadius={0.6}
                  pointsTransitionDuration={1200}
                  pointResolution={16}
                  onPointHover={(point: any) => {
                    setHoveredNewsTitle(point ? point.title : null);
                  }}
                  onPointClick={(point: any) => {
                    setSelectedNews(point);
                    if (point.relatedAsset) {
                      setSelectedTarget(point.relatedAsset);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Bottom Half: 2D World Map & Detail Monitor */}
          <div 
            className={`${styles.bottomHalf} ${
              activeView === '2d' ? styles.fullHeight : activeView === '3d' ? styles.collapsed : ''
            }`}
          >
            <div className={styles.mapContainer}>
              <svg 
                ref={mapSvgRef} 
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
              />

              {/* HTML Tooltip Overlay */}
              <div 
                className="map-2d-tooltip"
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  zIndex: 50,
                  transform: 'translate(-50%, -100%)',
                  opacity: 0,
                  transition: 'opacity 150ms ease',
                  boxSizing: 'border-box'
                }}
              />

              {/* Bottom Monitor Overlay */}
              {/* Bottom Monitor Overlay */}
              {selectedDetails && (
                !isBottomMonitorExpanded ? (
                  <div 
                    className={styles.minimizedStatusWidget}
                    onClick={() => setIsBottomMonitorExpanded(true)}
                  >
                    <span style={{ fontSize: '1rem' }}>📊</span>
                    <span style={{ fontWeight: 600 }}>{selectedDetails.name} ({selectedTarget})</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                    <span><GlitchCounter value={formatPrice(selectedTarget, selectedDetails.price)} /></span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                    <span style={{ 
                      color: selectedDetails.direction === 'UP' ? '#10b981' : selectedDetails.direction === 'DOWN' ? '#f43f5e' : '#06b6d4', 
                      fontWeight: '700' 
                    }}>
                      10分後: {selectedDetails.direction === 'UP' ? '▲ 上昇' : selectedDetails.direction === 'DOWN' ? '▼ 下落' : '▶ 横ばい'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      (的中率: {selectedDetails.accuracy}%)
                    </span>
                    <span style={{ color: 'var(--secondary)', marginLeft: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>詳細 ↗</span>
                  </div>
                ) : (
                  <div 
                    className="glass-panel" 
                    style={{ 
                      position: 'absolute', 
                      bottom: '20px', 
                      left: '20px', 
                      right: '20px', 
                      padding: '16px 24px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pointerEvents: 'auto',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{selectedDetails.name} ({selectedTarget})</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', background: 'rgba(6, 182, 212, 0.06)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                          {ASSETS_COORDS[selectedTarget].label}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        予測根拠: <span style={{ color: '#e5e7eb' }}>{selectedDetails.reason}</span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', alignItems: 'center', textAlign: 'right' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>現在値</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                          <GlitchCounter value={formatPrice(selectedTarget, selectedDetails.price)} />
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>10分後予測</div>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: '700', 
                          color: selectedDetails.direction === 'UP' ? '#10b981' : selectedDetails.direction === 'DOWN' ? '#f43f5e' : '#06b6d4', 
                          marginTop: '2px' 
                        }}>
                          {selectedDetails.direction === 'UP' ? '▲ 上昇 (UP)' : selectedDetails.direction === 'DOWN' ? '▼ 下落 (DOWN)' : '▶ 横ばい (FLAT)'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI 予測的中率</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                          {selectedDetails.accuracy}%
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>現在の補正バイアス</div>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: '700', 
                          color: selectedDetails.bias === 0 ? 'var(--text-muted)' : (selectedDetails.bias > 0 ? '#10b981' : '#f43f5e'), 
                          marginTop: '2px',
                          fontFamily: 'monospace'
                        }}>
                          {selectedDetails.bias > 0 ? `+${selectedDetails.bias.toFixed(2)}` : selectedDetails.bias.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '40px', margin: '0 8px' }} />

                      <button 
                        onClick={() => setIsBottomMonitorExpanded(false)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          fontSize: '0.78rem',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        ▼ 閉じる
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
            </>
          )}
        </main>
      )}
      
      {/* Hidden structure area for Gemini in Chrome sidepanel scan */}
      <div id="gemini-chrome-bridge" style={{ display: 'none' }}>
        {secretBridgeText}
      </div>
    </div>
  );
}
