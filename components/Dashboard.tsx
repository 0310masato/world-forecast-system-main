"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './Dashboard.module.css';
import * as d3 from 'd3';

// Globe.gl import (safe due to dynamic import on page level)
import Globe from 'react-globe.gl';

// Asset coordinate mappings
const ASSETS_COORDS: Record<string, { lat: number, lng: number, label: string, name: string }> = {
  BTC: { lat: 51.5074, lng: -0.1278, label: 'ロンドン (BTCノード)', name: 'ビットコイン' },
  USD_JPY: { lat: 35.6762, lng: 139.6503, label: '東京 (ドル円)', name: 'ドル円' },
  SP500: { lat: 40.7128, lng: -74.0060, label: 'ニューヨーク (S&P500)', name: 'S&P500' },
  Crude_Oil: { lat: 24.7136, lng: 46.6753, label: 'リヤド (原油)', name: '原油価格' },
  Gold: { lat: -26.2041, lng: 28.0473, label: 'ヨハネスブルグ (金)', name: '金' }
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

export default function Dashboard() {
  // Navigation & View layout states
  const [activeView, setActiveView] = useState<'split' | '3d' | '2d'>('split');
  const [selectedTarget, setSelectedTarget] = useState<string>('BTC');
  const [fastMode, setFastMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // API Data States
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);
  const [stats, setStats] = useState<BiasStat[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<ForecastItem[]>([]);
  const [evaluatedLogs, setEvaluatedLogs] = useState<string[]>([]);
  
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
        setEarthquakes(data.earthquakes);
        setStats(data.stats);
        setRecentPredictions(data.recent_predictions);
        
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

    const width = mapSvgRef.current.clientWidth || 800;
    const height = mapSvgRef.current.clientHeight || 400;

    // Define Projection (Mercator)
    const projection = d3.geoMercator()
      .scale(Math.min(width / 6.2, height / 2.6))
      .translate([width / 2, height / 1.7]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Draw Countries
    const mapG = svg.append('g').attr('class', 'countries');
    
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
    const eqG = svg.append('g').attr('class', 'earthquakes');
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

    // Draw Asset Pins
    const pinG = svg.append('g').attr('class', 'assets');
    
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

  }, [geoJsonData, earthquakes, selectedTarget, recentPredictions]);

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

      return {
        symbol,
        name: ASSETS_COORDS[symbol].name,
        price,
        direction: pendingPred?.predicted_direction || 'FLAT',
        reason: pendingPred?.reason || 'レンジ均衡状態',
        accuracy,
        bias: targetStat.bias_offset,
      };
    });
  }, [currentPrices, stats, recentPredictions]);

  // Selected item details for the bottom monitor
  const selectedDetails = useMemo(() => {
    return cardStats.find(s => s.symbol === selectedTarget) || null;
  }, [cardStats, selectedTarget]);

  return (
    <div className={styles.container}>
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
        </div>
      </header>

      {loading ? (
        <div className={styles.placeholderText} style={{ height: 'calc(100vh - 60px)' }}>
          データソースに接続中...
        </div>
      ) : (
        <main className={styles.content}>
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

                  // Render Asset markers via Labels
                  labelsData={labelData}
                  labelLat={(d: any) => d.lat}
                  labelLng={(d: any) => d.lng}
                  labelText={(d: any) => d.text}
                  labelColor={(d: any) => d.color}
                  labelSize={(d: any) => d.size}
                  labelDotRadius={0.4}
                  labelResolution={3}
                  onLabelClick={(label: any) => {
                    setSelectedTarget(label.symbol);
                  }}
                />
              )}
              
              {/* Left Panel: Real-Time Grid */}
              <div className={`${styles.floatingLeftPanel} glass-panel`}>
                <h3 className={styles.sectionTitle}>価格予測マトリクス</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cardStats.map((t) => (
                    <div 
                      key={t.symbol}
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: '8px', 
                        background: selectedTarget === t.symbol ? 'rgba(99, 102, 241, 0.12)' : 'rgba(5, 5, 12, 0.5)',
                        border: selectedTarget === t.symbol ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onClick={() => setSelectedTarget(t.symbol)}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {t.name}
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '1px 4px', borderRadius: '3px' }}>{t.symbol}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#e5e7eb', marginTop: '4px', fontWeight: '500' }}>
                          {formatPrice(t.symbol, t.price)}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          color: t.direction === 'UP' ? '#10b981' : t.direction === 'DOWN' ? '#f43f5e' : '#06b6d4', 
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          background: t.direction === 'UP' ? 'rgba(16, 185, 129, 0.08)' : t.direction === 'DOWN' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(6, 182, 212, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: t.direction === 'UP' ? '1px solid rgba(16, 185, 129, 0.2)' : t.direction === 'DOWN' ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid rgba(6, 182, 212, 0.2)',
                          display: 'inline-block'
                        }}>
                          {t.direction === 'UP' ? '▲ 上昇' : t.direction === 'DOWN' ? '▼ 下落' : '▶ 横ばい'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          的中率: <span style={{ color: '#fff', fontWeight: '600' }}>{t.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Evaluation Log Stream */}
              <div className={`${styles.floatingPanel} glass-panel`}>
                <h3 className={styles.sectionTitle}>AI自己改善ループコンソール</h3>
                <div 
                  ref={logConsoleRef}
                  style={{ 
                    height: '240px', 
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
              </div>
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
                style={{ width: '100%', height: '100%', display: 'block' }}
              />

              {/* Bottom Monitor Overlay */}
              {selectedDetails && (
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

                  <div style={{ display: 'flex', gap: '40px', textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>現在値</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                        {formatPrice(selectedTarget, selectedDetails.price)}
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
