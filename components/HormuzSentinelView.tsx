'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './HormuzSentinelView.module.css';
import {
  Vessel,
  WeatherCondition,
  GeopoliticalNews,
  HormuzTensionData,
  ActorMatrixRow,
  IncidentTimelineEvent,
  VesselType,
} from '@/lib/maritime/types';
import { HOTSPOTS, SHIPPING_LANES } from '@/lib/maritime/constants';

// Helper to convert Lat/Lng to SVG coordinates (based on 800x600 coordinate system)
const mapLng = (lng: number) => ((lng - 54.0) / (58.8 - 54.0)) * 800;
const mapLat = (lat: number) => (1 - (lat - 24.0) / (27.2 - 24.0)) * 600;

export default function HormuzSentinelView() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [tension, setTension] = useState<HormuzTensionData | null>(null);
  const [news, setNews] = useState<GeopoliticalNews[]>([]);
  
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [focusedHotspot, setFocusedHotspot] = useState<{ lat: number; lng: number; name: string } | null>(null);
  
  // Zoom & Pan states
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);

  // Fetch vessels, weather, tension
  const fetchHormuzData = async () => {
    try {
      const res = await fetch('/app/api/hormuz', { method: 'GET' }).catch(() => null);
      if (!res) {
        // Fallback for direct next.js routing structure check
        const resAlt = await fetch('/api/hormuz');
        const data = await resAlt.json();
        if (data.success) {
          setVessels(data.vessels);
          setWeather(data.weather);
          setTension(data.tension);
        }
        return;
      }
      const data = await res.json();
      if (data.success) {
        setVessels(data.vessels);
        setWeather(data.weather);
        setTension(data.tension);
      }
    } catch (err) {
      console.error('Failed to fetch Hormuz data:', err);
    }
  };

  // Fetch news
  const fetchNewsData = async () => {
    try {
      const res = await fetch('/app/api/hormuz/news', { method: 'GET' }).catch(() => null);
      if (!res) {
        const resAlt = await fetch('/api/hormuz/news');
        const data = await resAlt.json();
        if (data.success) {
          setNews(data.news);
        }
        return;
      }
      const data = await res.json();
      if (data.success) {
        setNews(data.news);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchHormuzData(), fetchNewsData()]);
      setLoading(false);
    };
    init();

    // Set polling
    const dataInterval = setInterval(fetchHormuzData, 5000);
    const newsInterval = setInterval(fetchNewsData, 8000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(newsInterval);
    };
  }, []);

  // Map mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.current.x);
    setPanY(e.clientY - dragStart.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.6, Math.min(4, prev * factor)));
  };

  const handleResetMap = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setFocusedHotspot(null);
  };

  // Focus on news location
  const handleNewsClick = (item: GeopoliticalNews) => {
    setSelectedNewsId(item.id === selectedNewsId ? null : item.id);
    if (item.location) {
      setFocusedHotspot(item.location);
      // Center pan on the coordinates (800x600 center is 400x300)
      const svgX = mapLng(item.location.lng);
      const svgY = mapLat(item.location.lat);
      
      const newZoom = 1.8;
      setZoom(newZoom);
      setPanX(400 - svgX * newZoom);
      setPanY(300 - svgY * newZoom);
    }
  };

  // Select vessel
  const selectedVessel = useMemo(() => {
    if (!selectedVesselId) return null;
    return vessels.find((v) => v.id === selectedVesselId) || null;
  }, [selectedVesselId, vessels]);

  // Generate dynamic Timeline events
  const timelineEvents = useMemo<IncidentTimelineEvent[]>(() => {
    const events: IncidentTimelineEvent[] = [];

    // Add news items
    news.forEach((item) => {
      events.push({
        id: item.id,
        timestamp: item.timestamp,
        type: 'GeopoliticalNews',
        description: item.title,
        severity: item.alertLevel === 'CRITICAL' ? 'CRITICAL' : item.alertLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
        vesselId: null,
        location: item.location ? { lat: item.location.lat, lng: item.location.lng } : null,
      });
    });

    // Add active vessel anomalies
    vessels.forEach((v) => {
      if (v.aisAnomalySuspicion) {
        events.push({
          id: `anomaly_${v.id}`,
          timestamp: v.lastUpdated,
          type: 'VesselAnomaly',
          description: `${v.name} : AIS受信異常疑い (${v.aisAnomalyType === 'position_jump' ? '位置ジャンプ' : '通信遅延/データ欠損'})`,
          severity: v.aisAnomalyConfidence === 'MEDIUM' ? 'HIGH' : 'MEDIUM',
          vesselId: v.id,
          location: { lat: v.lat, lng: v.lng },
        });
      }
    });

    // Sort descending by time
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [news, vessels]);

  // Compute Actor Matrix rows
  const actorMatrix = useMemo<ActorMatrixRow[]>(() => {
    const actorsList = ['US', 'Iran', 'Saudi Arabia', 'UAE', 'Houthi'];
    return actorsList.map((actor) => {
      const relevantNews = news.filter((n) => n.actors.includes(actor));
      const mentions = relevantNews.length;
      
      let latestCategory = 'N/A';
      let maxAlert: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'LOW';
      let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      if (mentions > 0) {
        // Sort news by time to get latest
        const sorted = [...relevantNews].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        latestCategory = sorted[0].categories.join(', ');
        
        // Find highest alert level
        const alerts: Record<'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL', number> = {
          LOW: 1, GUARDED: 2, ELEVATED: 3, HIGH: 4, CRITICAL: 5
        };
        for (const n of sorted) {
          if (alerts[n.alertLevel] > alerts[maxAlert]) {
            maxAlert = n.alertLevel;
            confidence = n.confidence;
          }
        }
      }

      // Map alert level to signal level
      let signalLevel: ActorMatrixRow['signalLevel'] = 'LOW';
      if (maxAlert === 'CRITICAL') signalLevel = 'CRITICAL';
      else if (maxAlert === 'HIGH') signalLevel = 'HIGH';
      else if (maxAlert === 'ELEVATED' || maxAlert === 'GUARDED') signalLevel = 'MEDIUM';

      return {
        actor,
        mentions,
        latestCategory,
        signalLevel,
        confidence,
      };
    });
  }, [news]);

  // Coastlines coordinates paths mapped to SVG
  const iranCoastPath = useMemo(() => {
    const coords = [
      [54.0, 27.2],
      [58.8, 27.2],
      [58.8, 25.5],
      [57.77, 25.64],
      [56.8, 26.3],
      [56.45, 27.05],
      [56.22, 27.14],
      [55.8, 26.9],
      [54.0, 26.8],
    ];
    return coords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${mapLng(pt[0])} ${mapLat(pt[1])}`).join(' ') + ' Z';
  }, []);

  const arabiaCoastPath = useMemo(() => {
    const coords = [
      [54.0, 24.0],
      [58.8, 24.0],
      [56.8, 24.5],
      [56.3, 25.1],
      [56.4, 26.4],
      [56.2, 26.3],
      [55.3, 25.3],
      [54.0, 24.2],
    ];
    return coords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${mapLng(pt[0])} ${mapLat(pt[1])}`).join(' ') + ' Z';
  }, []);

  // Shipping lane paths
  const inboundLanePath = useMemo(() => {
    return SHIPPING_LANES.inbound.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${mapLng(pt.lng)} ${mapLat(pt.lat)}`).join(' ');
  }, []);

  const outboundLanePath = useMemo(() => {
    return SHIPPING_LANES.outbound.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${mapLng(pt.lng)} ${mapLat(pt.lat)}`).join(' ');
  }, []);

  // Vessel Type colors helper
  const getVesselColor = (type: VesselType) => {
    switch (type) {
      case 'Crude Oil Tanker': return '#f43f5e'; // Red
      case 'Product Tanker': return '#f97316'; // Orange
      case 'LNG / LPG Carrier': return '#eab308'; // Amber
      case 'Container Ship': return '#3b82f6'; // Blue
      case 'Bulk Carrier': return '#6366f1'; // Indigo
      case 'General Cargo': return '#10b981'; // Emerald
      case 'Tug / Pilot / Service': return '#06b6d4'; // Cyan
      default: return '#9ca3af'; // Gray
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(6, 182, 212, 0.1)',
            borderTop: '3px solid #06b6d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '0.9rem', color: '#06b6d4', letterSpacing: '1px' }}>ホルムズ海峡監視システム 展開中...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gridBg} />
      <div className={styles.radarSweep} />

      {/* Watermark Label */}
      <div className={styles.watermark}>
        <span className={styles.watermarkLabel}>🛡️ HOR M U Z  S E N T I N E L  M O D E (MOCK)</span>
      </div>

      {/* SVG Tactical Map */}
      <div 
        className={styles.mapWrapper} 
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 800 600" 
          style={{ background: '#070a13', userSelect: 'none', display: 'block' }}
        >
          {/* Zoom/Pan Transform Group */}
          <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
            {/* Grid coordinate markers */}
            <g stroke="rgba(255,255,255,0.02)" strokeWidth="0.5">
              <line x1="0" y1="150" x2="800" y2="150" />
              <line x1="0" y1="300" x2="800" y2="300" />
              <line x1="0" y1="450" x2="800" y2="450" />
              <line x1="200" y1="0" x2="200" y2="600" />
              <line x1="400" y1="0" x2="400" y2="600" />
              <line x1="600" y1="0" x2="600" y2="600" />
            </g>

            {/* Coastline Arabia */}
            <path 
              d={arabiaCoastPath} 
              fill="rgba(15, 23, 42, 0.55)" 
              stroke="rgba(71, 85, 105, 0.4)" 
              strokeWidth="1.5" 
            />

            {/* Coastline Iran */}
            <path 
              d={iranCoastPath} 
              fill="rgba(21, 27, 44, 0.65)" 
              stroke="rgba(71, 85, 105, 0.4)" 
              strokeWidth="1.5" 
            />

            {/* Islands */}
            {HOTSPOTS.filter((h) => h.type === 'island').map((island) => (
              <g key={island.id}>
                <circle 
                  cx={mapLng(island.lng)} 
                  cy={mapLat(island.lat)} 
                  r="6" 
                  fill="rgba(100, 116, 139, 0.7)" 
                  stroke="rgba(148, 163, 184, 0.5)" 
                  strokeWidth="1" 
                />
                <text 
                  x={mapLng(island.lng) + 10} 
                  y={mapLat(island.lat) + 3} 
                  fill="rgba(255,255,255,0.4)" 
                  fontSize="8" 
                  fontWeight="600"
                >
                  {island.name}
                </text>
              </g>
            ))}

            {/* Shipping Lanes (Traffic Separation Scheme) */}
            <g strokeWidth="2" fill="none">
              {/* Inbound Lane (dashed) */}
              <path 
                d={inboundLanePath} 
                stroke="rgba(16, 185, 129, 0.15)" 
                strokeDasharray="4 4" 
              />
              {/* Outbound Lane (dashed) */}
              <path 
                d={outboundLanePath} 
                stroke="rgba(59, 130, 246, 0.15)" 
                strokeDasharray="4 4" 
              />
            </g>

            {/* Hotspots / Port icons */}
            {HOTSPOTS.filter((h) => h.type !== 'island').map((spot) => {
              const isFocused = focusedHotspot?.name === spot.name;
              return (
                <g key={spot.id}>
                  {isFocused && (
                    <circle
                      cx={mapLng(spot.lng)}
                      cy={mapLat(spot.lat)}
                      r="25"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1"
                      className={styles.pulseRing}
                    />
                  )}
                  <circle 
                    cx={mapLng(spot.lng)} 
                    cy={mapLat(spot.lat)} 
                    r="4" 
                    fill={spot.type === 'chokepoint' ? '#ef4444' : '#06b6d4'} 
                  />
                  <text 
                    x={mapLng(spot.lng) + 8} 
                    y={mapLat(spot.lat) - 6} 
                    fill={isFocused ? '#22d3ee' : 'rgba(255,255,255,0.5)'} 
                    fontSize="8.5" 
                    fontWeight={isFocused ? 'bold' : 'normal'}
                  >
                    {spot.name}
                  </text>
                </g>
              );
            })}

            {/* Animated Weather Overlay (Flow vector lines) */}
            {weather && (
              <g stroke="rgba(6, 182, 212, 0.04)" strokeWidth="1" fill="none">
                {/* Dynamically drawing shifting lines pointing in the direction of current/wind */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angleRad = (weather.windDir * Math.PI) / 180;
                  const dx = Math.sin(angleRad) * 40;
                  const dy = -Math.cos(angleRad) * 40;
                  
                  // Layout in grid
                  const row = Math.floor(i / 4);
                  const col = i % 4;
                  const bx = 100 + col * 200;
                  const by = 80 + row * 180;

                  return (
                    <line 
                      key={`wind_${i}`} 
                      x1={bx} 
                      y1={by} 
                      x2={bx + dx} 
                      y2={by + dy} 
                      strokeDasharray="4,6"
                      style={{
                        animation: `windFlowAnimation 3s linear infinite`,
                        stroke: weather.description.includes('砂塵') ? 'rgba(245, 158, 11, 0.06)' : 'rgba(6, 182, 212, 0.04)'
                      }}
                    />
                  );
                })}
                <style>{`
                  @keyframes windFlowAnimation {
                    0% { stroke-dashoffset: 20; }
                    100% { stroke-dashoffset: 0; }
                  }
                `}</style>
              </g>
            )}

            {/* Vessels */}
            {vessels.map((v) => {
              const x = mapLng(v.lng);
              const y = mapLat(v.lat);
              const isSelected = selectedVesselId === v.id;
              const color = getVesselColor(v.type);

              return (
                <g 
                  key={v.id} 
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVesselId(v.id === selectedVesselId ? null : v.id);
                  }}
                >
                  {/* AIS Anomaly Warning pulse */}
                  {v.aisAnomalySuspicion && (
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      className={styles.pulseRing}
                    />
                  )}

                  {/* Selected target brackets */}
                  {isSelected && (
                    <g stroke="#06b6d4" strokeWidth="1.5" fill="none">
                      <path d="M -12 -6 L -12 -12 L -6 -12" />
                      <path d="M 6 -12 L 12 -12 L 12 -6" />
                      <path d="M 12 6 L 12 12 L 6 12" />
                      <path d="M -6 12 L -12 12 L -12 6" />
                    </g>
                  )}

                  {/* Directional Triangle marker */}
                  <polygon
                    points="0,-8 5,6 -5,6"
                    transform={`rotate(${v.heading})`}
                    fill={color}
                    stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.4)'}
                    strokeWidth="1"
                  />

                  {/* Tiny indicator label */}
                  {(zoom >= 1.2 || isSelected) && (
                    <text
                      x="8"
                      y="3"
                      fill={isSelected ? '#22d3ee' : '#cbd5e1'}
                      fontSize="7.5"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      style={{ pointerEvents: 'none', background: 'rgba(0,0,0,0.8)' }}
                    >
                      {v.name}
                      {v.aisAnomalySuspicion && '⚠️'}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Map Control Buttons */}
      <div className={styles.mapControls}>
        <button className={styles.mapControlBtn} onClick={() => handleZoom(1.2)}>＋</button>
        <button className={styles.mapControlBtn} onClick={() => handleZoom(0.8)}>－</button>
        <button className={styles.mapControlBtn} onClick={handleResetMap} style={{ fontSize: '0.8rem' }}>復帰</button>
      </div>

      {/* Left Panel: Risk & Weather */}
      <div className={`${styles.leftPanel} ${styles.glassPanel}`}>
        {/* Tension Meter */}
        <div>
          <div className={styles.tensionHeader}>
            <span className={styles.tensionTitle}>海峡緊張指数</span>
            <div className={styles.tensionScoreArea}>
              <span className={`${styles.tensionScoreVal} ${
                tension ? styles[`level${tension.level}`] : ''
              }`}>
                {tension ? tension.score : '--'}
              </span>
              <span className={`${styles.tensionLevelBadge} ${
                tension ? styles[`level${tension.level}`] : ''
              }`}>
                {tension ? tension.level : 'UNKNOWN'}
              </span>
            </div>
          </div>

          <div className={styles.breakdownList}>
            {tension && Object.entries(tension.breakdown).map(([key, val]) => {
              const labelMap: Record<string, string> = {
                maritimeOperational: '海事・気象運行リスク',
                geopolitical: '地政学ニュース因子',
                conflict: '局地武力衝突リスク',
                energySecurity: 'エネルギー供給脅威',
                aisAnomaly: 'AIS電波異常疑い',
              };
              
              // Color bar based on sub-risk score
              let barColor = '#10b981';
              if (val > 80) barColor = '#ef4444';
              else if (val > 60) barColor = '#f97316';
              else if (val > 40) barColor = '#f59e0b';
              else if (val > 20) barColor = '#06b6d4';

              return (
                <div key={key} className={styles.breakdownItem}>
                  <div className={styles.breakdownLabelRow}>
                    <span>{labelMap[key] || key}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{val}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${val}%`, backgroundColor: barColor }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />

        {/* Environmental Indicators */}
        <div>
          <h4 className={styles.detailSectionTitle} style={{ marginBottom: '12px' }}>海峡環境インジケータ</h4>
          <div className={styles.weatherGrid}>
            <div className={styles.weatherCard}>
              <span className={styles.weatherLabel}>局地天気</span>
              <span className={styles.weatherValue} style={{ fontSize: '0.8rem', color: weather?.description.includes('砂塵') ? '#f59e0b' : '#fff' }}>
                {weather ? weather.description : '--'}
              </span>
            </div>
            <div className={styles.weatherCard}>
              <span className={styles.weatherLabel}>気温</span>
              <span className={styles.weatherValue}>{weather ? `${weather.temp} °C` : '--'}</span>
            </div>
            <div className={styles.weatherCard}>
              <span className={styles.weatherLabel}>風速・風向</span>
              <span className={styles.weatherValue} style={{ fontSize: '0.8rem' }}>
                {weather ? `${weather.windSpeed} kt (${weather.windDir}°)` : '--'}
              </span>
            </div>
            <div className={styles.weatherCard}>
              <span className={styles.weatherLabel}>平均波高</span>
              <span className={styles.weatherValue}>{weather ? `${weather.waveHeight} m` : '--'}</span>
            </div>
            <div className={styles.weatherCard}>
              <span className={styles.weatherLabel}>海流流速・流向</span>
              <span className={styles.weatherValue} style={{ fontSize: '0.8rem' }}>
                {weather ? `${weather.currentSpeed} kt (${weather.currentDir}°)` : '--'}
              </span>
            </div>
            <div className={styles.weatherCard}>
              <span className={styles.weatherLabel}>視程範囲</span>
              <span className={styles.weatherValue}>{weather ? `${weather.visibility} km` : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Vessel details & Geopolitical feed */}
      <div className={`${styles.rightPanel} ${styles.glassPanel}`}>
        {/* Vessel details (if selected) */}
        {selectedVessel ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className={styles.detailSectionTitle} style={{ margin: 0 }}>船舶鑑定インテル</h4>
              <button 
                onClick={() => setSelectedVesselId(null)}
                style={{
                  background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.8rem'
                }}
              >
                ✕ 閉じる
              </button>
            </div>
            
            <div className={styles.vesselDetailGrid}>
              <div className={styles.vesselDetailItem}>
                <span className={styles.vesselDetailLabel}>船名 (MMSI)</span>
                <span className={styles.vesselDetailVal}>{selectedVessel.name} ({selectedVessel.id})</span>
              </div>
              <div className={styles.vesselDetailItem}>
                <span className={styles.vesselDetailLabel}>船種</span>
                <span className={styles.vesselDetailVal} style={{ color: getVesselColor(selectedVessel.type) }}>
                  {selectedVessel.type}
                </span>
              </div>
              <div className={styles.vesselDetailItem}>
                <span className={styles.vesselDetailLabel}>対地速度 (SOG)</span>
                <span className={styles.vesselDetailVal}>{selectedVessel.speed} kt</span>
              </div>
              <div className={styles.vesselDetailItem}>
                <span className={styles.vesselDetailLabel}>針路 (Heading)</span>
                <span className={styles.vesselDetailVal}>{selectedVessel.heading}°</span>
              </div>
              <div className={styles.vesselDetailItem}>
                <span className={styles.vesselDetailLabel}>AIS運航ステータス</span>
                <span className={styles.vesselDetailVal} style={{ fontSize: '0.7rem' }}>{selectedVessel.status}</span>
              </div>
              <div className={styles.vesselDetailItem}>
                <span className={styles.vesselDetailLabel}>更新時刻</span>
                <span className={styles.vesselDetailVal} style={{ fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  {new Date(selectedVessel.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Estimated Cargo Box */}
            <div className={styles.vesselEstimatedCard}>
              <div className={styles.vesselEstimatedTitle}>
                <span>📦 推定積載貨物 (Estimated Cargo)</span>
                <span className={`${styles.newsTag} ${
                  selectedVessel.cargoConfidence === 'HIGH' ? styles.levelLOW : selectedVessel.cargoConfidence === 'MEDIUM' ? styles.levelELEVATED : styles.levelCRITICAL
                }`}>
                  信頼度: {selectedVessel.cargoConfidence}
                </span>
              </div>
              <div style={{ color: '#fff', fontWeight: 500 }}>{selectedVessel.cargo}</div>
            </div>

            {/* Estimated Route Box */}
            <div className={styles.vesselEstimatedCard}>
              <div className={styles.vesselEstimatedTitle}>
                <span>🗺️ 推定航路 (Estimated Route)</span>
                <span className={`${styles.newsTag} ${
                  selectedVessel.routeConfidence === 'HIGH' ? styles.levelLOW : selectedVessel.routeConfidence === 'MEDIUM' ? styles.levelELEVATED : styles.levelCRITICAL
                }`}>
                  信頼度: {selectedVessel.routeConfidence}
                </span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>出発地:</span> <strong style={{ color: '#fff' }}>{selectedVessel.origin}</strong>
              </div>
              <div style={{ marginTop: '2px' }}>
                <span style={{ color: '#9ca3af' }}>目的地:</span> <strong style={{ color: '#fff' }}>{selectedVessel.destination}</strong>
              </div>
            </div>

            {/* Estimated Stop Reason (if any) */}
            {selectedVessel.stopReason && (
              <div className={styles.vesselEstimatedCard} style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.03)' }}>
                <div className={styles.vesselEstimatedTitle} style={{ color: '#ef4444' }}>
                  <span>⚠️ 停止・低速・挙動異常 (Behavior Anomaly)</span>
                  <span className={`${styles.newsTag} ${
                    selectedVessel.stopReasonConfidence === 'HIGH' ? styles.levelLOW : selectedVessel.stopReasonConfidence === 'MEDIUM' ? styles.levelELEVATED : styles.levelCRITICAL
                  }`}>
                    信頼度: {selectedVessel.stopReasonConfidence || 'LOW'}
                  </span>
                </div>
                <div style={{ color: '#fca5a5', lineHeight: 1.3 }}>{selectedVessel.stopReason}</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h4 className={styles.detailSectionTitle}>地政学インテルフィード</h4>
            <div className={styles.newsList}>
              {news.map((item) => {
                const isActive = selectedNewsId === item.id;
                
                let alertClass = styles.levelLOW;
                if (item.alertLevel === 'CRITICAL') alertClass = styles.levelCRITICAL;
                else if (item.alertLevel === 'HIGH') alertClass = styles.levelHIGH;
                else if (item.alertLevel === 'ELEVATED') alertClass = styles.levelELEVATED;
                else if (item.alertLevel === 'GUARDED') alertClass = styles.levelGUARDED;

                return (
                  <div 
                    key={item.id} 
                    className={`${styles.newsCard} ${isActive ? styles.newsCardActive : ''}`}
                    onClick={() => handleNewsClick(item)}
                  >
                    <div className={styles.newsTitle}>{item.title}</div>
                    
                    {isActive && (
                      <p style={{ fontSize: '0.72rem', color: '#d1d5db', margin: '4px 0 10px', lineHeight: 1.4 }}>
                        {item.summary}
                      </p>
                    )}

                    <div className={styles.newsMeta}>
                      <span className={`${styles.newsTag} ${alertClass}`}>
                        {item.alertLevel}
                      </span>
                      <span className={`${styles.newsTag}`} style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
                        検証: {item.verificationStatus}
                      </span>
                      <span className={styles.newsSource}>
                        {item.source}
                      </span>
                    </div>

                    {/* Caution tag (demarcates demo/simulated contents) */}
                    {item.cautionLabel && (
                      <div style={{
                        marginTop: '8px', padding: '4px 6px', fontSize: '0.62rem', background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '3px'
                      }}>
                        {item.cautionLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />

        {/* Actor Matrix */}
        <div>
          <h4 className={styles.detailSectionTitle} style={{ marginBottom: '8px' }}>周辺アクターニュース言及状況</h4>
          <table className={styles.actorTable}>
            <thead>
              <tr>
                <th>アクター勢力</th>
                <th style={{ textAlign: 'center' }}>言及数</th>
                <th>直近カテゴリ</th>
                <th>シグナル度</th>
                <th>信頼度</th>
              </tr>
            </thead>
            <tbody>
              {actorMatrix.map((row) => {
                let badgeClass = styles.levelLOW;
                if (row.signalLevel === 'CRITICAL') badgeClass = styles.levelCRITICAL;
                else if (row.signalLevel === 'HIGH') badgeClass = styles.levelHIGH;
                else if (row.signalLevel === 'MEDIUM') badgeClass = styles.levelELEVATED;

                let confClass = styles.levelLOW;
                if (row.confidence === 'HIGH') confClass = styles.levelLOW; // Green-ish badge
                else if (row.confidence === 'MEDIUM') confClass = styles.levelELEVATED;
                else if (row.confidence === 'LOW') confClass = styles.levelCRITICAL;

                return (
                  <tr key={row.actor}>
                    <td className={styles.actorName}>{row.actor}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>{row.mentions}</td>
                    <td style={{ color: '#9ca3af', fontSize: '0.68rem', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.latestCategory}
                    </td>
                    <td>
                      <span className={`${styles.newsTag} ${badgeClass}`}>
                        {row.signalLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.newsTag} ${confClass}`}>
                        {row.confidence}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Panel: Interactive Timeline & Warning Disclaimer */}
      <div className={`${styles.bottomPanel} ${styles.glassPanel}`}>
        {/* Left Side: Dynamic Event Timeline ticker */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#06b6d4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📡 リアルタイム異常・インシデント監視
          </div>
          <div className={styles.timelineContainer}>
            {timelineEvents.slice(0, 5).map((evt) => {
              const isAnomaly = evt.type === 'VesselAnomaly';
              return (
                <div 
                  key={evt.id} 
                  className={styles.timelineEvent} 
                  style={{ borderColor: isAnomaly ? '#ef4444' : '#6b7280', cursor: evt.location ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (evt.location) {
                      setFocusedHotspot({ lat: evt.location.lat, lng: evt.location.lng, name: 'インシデント発生源' });
                      const svgX = mapLng(evt.location.lng);
                      const svgY = mapLat(evt.location.lat);
                      const newZoom = 2.0;
                      setZoom(newZoom);
                      setPanX(400 - svgX * newZoom);
                      setPanY(300 - svgY * newZoom);
                    }
                  }}
                >
                  <div className={styles.timelineTime}>
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </div>
                  <div className={styles.timelineDesc} title={evt.description}>
                    {evt.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Global Warning Disclaimer */}
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className={styles.bottomDisclaimerText}>
            【免責事項】本画面の情報はシミュレーションおよびAISデータに基づく推定であり、その正確性や実在性を保証するものではありません。
          </p>
          <p className={styles.bottomDisclaimerText} style={{ marginTop: '2px', fontWeight: 'bold', color: '#ef4444' }}>
            実際の航行判断、軍事防衛判断、および投資判断には絶対に使用しないでください。
          </p>
        </div>
      </div>
    </div>
  );
}
