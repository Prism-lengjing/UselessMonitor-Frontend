import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types & Data ---

type Status = 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';
type Lang = 'en' | 'zh';

interface RemoteConfig {
  apiBaseUrl: string;
  readKey: string;
}

interface ApiMonitor {
  id: string | number;
  name: string;
  type?: string;
  status?: string;
  last_check?: string;
  latency?: number;
  uptime?: number;
  region?: string;
}

interface Service {
  id: string;
  name: string;
  status: Status;
  latency: number;
  uptime: number;
  region: string;
}

interface LogEntry {
  timestamp: string;
  message: { en: string; zh: string };
  type: 'INFO' | 'WARN' | 'CRIT';
}

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'CORE_GATEWAY', status: 'OPERATIONAL', latency: 24, uptime: 99.99, region: 'US-EAST' },
  { id: '2', name: 'NEURAL_DB_SHARD_01', status: 'OPERATIONAL', latency: 12, uptime: 99.95, region: 'US-WEST' },
  { id: '3', name: 'AUTH_MATRIX', status: 'DEGRADED', latency: 154, uptime: 98.50, region: 'EU-CENTRAL' },
  { id: '4', name: 'QUANTUM_STORAGE', status: 'OPERATIONAL', latency: 45, uptime: 99.99, region: 'ASIA-PAC' },
  { id: '5', name: 'RENDER_FARM_ALPHA', status: 'OFFLINE', latency: 0, uptime: 85.20, region: 'US-EAST' },
  { id: '6', name: 'EVENT_STREAM_BUS', status: 'OPERATIONAL', latency: 8, uptime: 99.99, region: 'GLOBAL' },
];

// --- I18n Dictionary ---

const DICTIONARY = {
  en: {
    title: 'SYSTEM_STATUS',
    subtitle: 'INTERSTELLAR LINK MONITORING',
    integrity: 'SYSTEM INTEGRITY',
    latency: 'LATENCY',
    uptime: 'UPTIME',
    region: 'REGION',
    load: 'LOAD',
    id: 'ID',
    events: 'SYSTEM_EVENT_STREAM',
    autoScroll: 'AUTO_SCROLL',
    live: 'LIVE',
    secure: 'SECURE CONNECTION',
    node: 'NODE',
    coords: 'COORDS',
    time: 'SERVER_TIME',
    status: {
      OPERATIONAL: 'OPERATIONAL',
      DEGRADED: 'DEGRADED',
      OFFLINE: 'OFFLINE',
      MAINTENANCE: 'MAINTENANCE'
    }
  },
  zh: {
    title: '系统状态',
    subtitle: '星际链路监控',
    integrity: '系统完整性',
    latency: '延迟',
    uptime: '运行时间',
    region: '区域',
    load: '负载',
    id: '编号',
    events: '系统事件流',
    autoScroll: '自动滚动',
    live: '实时',
    secure: '安全连接',
    node: '节点',
    coords: '坐标',
    time: '服务器时间',
    status: {
      OPERATIONAL: '运行正常',
      DEGRADED: '性能降级',
      OFFLINE: '离线',
      MAINTENANCE: '维护中'
    }
  }
};

// --- Helper Components ---

const HexColor = {
  cyan: '#00f3ff',
  red: '#ff2a2a',
  yellow: '#ffc600',
  purple: '#bd00ff',
  dark: '#0a0a12',
  dim: 'rgba(0, 243, 255, 0.1)',
};

const normalizeStatus = (status?: string): Status => {
  if (!status) return 'MAINTENANCE';
  const normalized = status.toLowerCase();
  if (normalized.includes('degrad')) return 'DEGRADED';
  if (normalized.includes('maint')) return 'MAINTENANCE';
  if (normalized.includes('off') || normalized.includes('down') || normalized.includes('fail')) return 'OFFLINE';
  return 'OPERATIONAL';
};

const mapMonitorToService = (monitor: ApiMonitor, index: number): Service => {
  return {
    id: String(monitor.id ?? index + 1),
    name: monitor.name ?? `MONITOR_${index + 1}`,
    status: normalizeStatus(monitor.status),
    latency: monitor.latency ?? Math.floor(Math.random() * 150) + 10,
    uptime: Number((monitor.uptime ?? (95 + Math.random() * 5)).toFixed(2)),
    region: monitor.region ?? monitor.type ?? 'GLOBAL'
  };
};

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'OPERATIONAL': return HexColor.cyan;
    case 'DEGRADED': return HexColor.yellow;
    case 'OFFLINE': return HexColor.red;
    case 'MAINTENANCE': return HexColor.purple;
    default: return '#fff';
  }
};

// --- Background Component (Starry Quicksand) ---

const StarryQuicksand = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const particleCount = 800;

    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;
      opacity: number;
      fadeSpeed: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Flow diagonally down-left
        this.speedY = 0.2 + Math.random() * 0.8;
        this.speedX = -0.1 - Math.random() * 0.3;
        
        // Rectangular "sand" grains
        this.size = 0.5 + Math.random() * 1.5; 
        this.opacity = Math.random() * 0.8;
        this.fadeSpeed = 0.002 + Math.random() * 0.005;
        
        // Occasional colored grains
        const rand = Math.random();
        if (rand > 0.98) this.color = HexColor.cyan;
        else if (rand > 0.96) this.color = HexColor.purple;
        else this.color = '#ffffff';
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Twinkle
        this.opacity += this.fadeSpeed;
        if (this.opacity > 0.8 || this.opacity < 0.1) {
          this.fadeSpeed = -this.fadeSpeed;
        }

        // Reset if out of bounds
        if (this.y > height || this.x < 0) {
          this.y = -10;
          this.x = Math.random() * width + 100; // Offset to fill corner
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color === '#ffffff' 
          ? `rgba(255, 255, 255, ${this.opacity})` 
          : this.color; // Keep colored ones bright
        
        ctx.globalAlpha = this.color === '#ffffff' ? 1 : 0.6;
        
        // Sharp squares/rectangles
        const length = this.size * (1 + Math.random()); // Slight stretch effect for motion
        ctx.fillRect(this.x, this.y, length, this.size);
        ctx.globalAlpha = 1.0;
      }
    }

    // Initialize
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = '#050508'; // Clear with solid color to avoid trails
      ctx.fillRect(0, 0, width, height);
      
      // Draw a subtle grid in background
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 100) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 100) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: -1,
        pointerEvents: 'none'
      }} 
    />
  );
};

// --- UI Components ---

const GlitchText = ({ text, subtext }: { text: string, subtext: string }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
      <h1 className="glitch-title" style={{ 
        margin: 0, 
        fontSize: '3.5rem', 
        fontWeight: 700, 
        color: '#fff',
        letterSpacing: '6px',
        textTransform: 'uppercase',
        position: 'relative',
        fontFamily: '"Rajdhani", "Noto Sans SC", sans-serif',
      }}>
        {text}
      </h1>
      <div style={{ 
        color: HexColor.cyan, 
        letterSpacing: '4px', 
        fontSize: '1rem', 
        marginTop: '5px',
        fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
        background: 'linear-gradient(90deg, transparent, rgba(0,243,255,0.1), transparent)',
        padding: '2px 10px'
      }}>
        // {subtext}
      </div>
      
      <style>{`
        .glitch-title {
          text-shadow: 2px 0 ${HexColor.red}, -2px 0 ${HexColor.cyan};
          animation: glitch 3s infinite linear alternate-reverse;
        }
        @keyframes glitch {
          0% { text-shadow: 2px 0 ${HexColor.red}, -2px 0 ${HexColor.cyan}; transform: skewX(0deg); }
          90% { text-shadow: 2px 0 ${HexColor.red}, -2px 0 ${HexColor.cyan}; transform: skewX(0deg); }
          91% { text-shadow: -2px 0 ${HexColor.red}, 2px 0 ${HexColor.cyan}; transform: skewX(10deg); }
          92% { text-shadow: 2px 0 ${HexColor.red}, -2px 0 ${HexColor.cyan}; transform: skewX(-10deg); }
          93% { text-shadow: 0 0 ${HexColor.red}, 0 0 ${HexColor.cyan}; transform: skewX(0deg); }
          100% { text-shadow: 2px 0 ${HexColor.red}, -2px 0 ${HexColor.cyan}; transform: skewX(0deg); }
        }
      `}</style>
    </div>
  );
};

const Card: React.FC<{ service: Service; lang: Lang }> = ({ service, lang }) => {
  const color = getStatusColor(service.status);
  const t = DICTIONARY[lang];
  
  // Clip-path for cut corner (bottom-right and top-left for tech feel)
  const clipPath = "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)";
  
  return (
    <div 
      className="service-card"
      style={{
        position: 'relative',
        clipPath: clipPath,
        background: 'rgba(10, 12, 16, 0.85)',
        borderLeft: `4px solid ${color}`,
        padding: '1.5rem',
        color: '#fff',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05)'
      }}
    >
      {/* Decorative Grid Background inside card */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#fff' }}>
            {service.name}
          </h3>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>{t.id}: {service.id.padStart(4, '0')}</div>
        </div>
        <div style={{ 
          background: color, 
          color: '#000', 
          padding: '4px 8px', 
          fontSize: '0.75rem', 
          fontWeight: 'bold',
          clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0% 100%)',
          textTransform: 'uppercase'
        }}>
          {t.status[service.status]}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 1 }}>
        {/* Latency */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#888', marginBottom: '2px' }}>{t.latency}</div>
          <div style={{ color: service.latency > 100 ? HexColor.yellow : HexColor.cyan, fontSize: '1.2rem' }}>
            {service.status === 'OFFLINE' ? '---' : <>{service.latency}<span style={{ fontSize: '0.8rem', opacity: 0.7 }}>ms</span></>}
          </div>
        </div>
        
        {/* Uptime */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#888', marginBottom: '2px' }}>{t.uptime}</div>
          <div style={{ color: '#fff', fontSize: '1.2rem' }}>
            {service.uptime}<span style={{ fontSize: '0.8rem', opacity: 0.7 }}>%</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Graph */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginBottom: '6px' }}>
          <span>{t.region}: {service.region}</span>
          <span>{t.load}</span>
        </div>
        
        {/* Sharp Load Bar */}
        <div style={{ width: '100%', height: '4px', background: '#222', position: 'relative' }}>
          <div style={{ 
             width: service.status === 'OFFLINE' ? '0%' : `${Math.random() * 40 + 30}%`, 
             height: '100%', 
             background: color,
             boxShadow: `0 0 10px ${color}80` 
          }}></div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="hover-effect" style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: `linear-gradient(135deg, transparent 0%, ${color}10 100%)`,
        border: `1px solid ${color}`,
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.2s',
        zIndex: 2
      }}></div>
      
      <style>{`
        .service-card:hover {
          transform: translateY(-4px);
        }
        .service-card:hover .hover-effect {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

const Terminal = ({ logs, lang }: { logs: LogEntry[]; lang: Lang }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const t = DICTIONARY[lang];
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={{
      marginTop: '3rem',
      border: '1px solid #333',
      background: 'rgba(5, 5, 8, 0.95)',
      padding: '0',
      fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
      height: '250px',
      display: 'flex',
      flexDirection: 'column',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30px 100%, 0 calc(100% - 30px))', // Cut bottom-left corner
      position: 'relative'
    }}>
      {/* Terminal Header */}
      <div style={{ 
        background: '#1a1a20', 
        padding: '0.5rem 1rem', 
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: '#888'
      }}>
        <span>// {t.events}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
           <span>{t.autoScroll}: ON</span>
           <span style={{ color: HexColor.cyan }}>{t.live}</span>
        </div>
      </div>

      {/* Logs Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', fontSize: '0.85rem' }}>
        {logs.map((log, i) => {
           const isCritical = log.type === 'CRIT';
           const isWarn = log.type === 'WARN';
           
           return (
            <div key={i} style={{ marginBottom: '6px', display: 'flex', opacity: 0.9 }}>
              <span style={{ color: '#444', marginRight: '15px', minWidth: '80px' }}>
                [{log.timestamp}]
              </span>
              <span style={{ 
                color: isCritical ? HexColor.red : isWarn ? HexColor.yellow : HexColor.cyan,
                textShadow: isCritical ? `0 0 5px ${HexColor.red}` : 'none'
              }}>
                {`> ${log.message[lang]}`}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
};

const GlobalStatusIndicator = ({ status, lang }: { status: Status; lang: Lang }) => {
  const color = getStatusColor(status);
  const t = DICTIONARY[lang];
  return (
    <div style={{ 
      textAlign: 'right', 
      borderRight: `4px solid ${color}`, 
      paddingRight: '1.5rem',
      height: '100%'
    }}>
      <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '2px' }}>{t.integrity}</div>
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        color: color,
        textShadow: `0 0 20px ${color}60`,
        fontFamily: '"Rajdhani", "Noto Sans SC", sans-serif',
        lineHeight: 1
      }}>
        {t.status[status]}
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString([], { hour12: false }), message: { en: 'INITIALIZING SYSTEM MONITOR...', zh: '正在初始化系统监控...' }, type: 'INFO' },
    { timestamp: new Date().toLocaleTimeString([], { hour12: false }), message: { en: 'ESTABLISHING SECURE UPLINK...', zh: '建立安全上行链路...' }, type: 'INFO' }
  ]);
  const [globalStatus, setGlobalStatus] = useState<Status>('OPERATIONAL');
  const [lang, setLang] = useState<Lang>('en');
  const [config, setConfig] = useState<RemoteConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const t = DICTIONARY[lang];

  const addLog = useCallback((message: { en: string; zh: string }, type: 'INFO' | 'WARN' | 'CRIT' = 'INFO') => {
    setLogs(prev => [...prev.slice(-19), {
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type
    }]);
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadConfig = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Unable to load config.json (HTTP ${response.status})`);
        const data = await response.json();
        if (!data.apiBaseUrl || !data.readKey) {
          throw new Error('config.json must include "apiBaseUrl" and "readKey"');
        }
        if (!isActive) return;
        setConfig({
          apiBaseUrl: String(data.apiBaseUrl).replace(/\/$/, ''),
          readKey: String(data.readKey)
        });
        setConfigError(null);
      } catch (err) {
        if (!isActive) return;
        setConfigError((err as Error).message);
      } finally {
        if (isActive) setIsConfigLoading(false);
      }
    };

    loadConfig();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!config) return;
    let isActive = true;
    const headers = { Authorization: config.readKey };

    const requestData = async () => {
      try {
        setIsFetching(true);
        const monitorResponse = await fetch(`${config.apiBaseUrl}/monitor`, { headers });
        if (!monitorResponse.ok) {
          throw new Error(`GET /monitor failed (${monitorResponse.status})`);
        }
        const monitorData: ApiMonitor[] = await monitorResponse.json();
        if (!isActive) return;
        if (Array.isArray(monitorData)) {
          setServices(monitorData.map((monitor, index) => mapMonitorToService(monitor, index)));
          addLog({
            en: `Fetched ${monitorData.length} monitors from API`,
            zh: `已从 API 获取 ${monitorData.length} 个监控项`
          }, 'INFO');
        } else {
          throw new Error('Monitor payload must be an array');
        }

        const statusResponse = await fetch(`${config.apiBaseUrl}/status`, { headers });
        if (statusResponse.ok) {
          const statusPayload = await statusResponse.json();
          if (statusPayload?.status) {
            setGlobalStatus(normalizeStatus(statusPayload.status));
          }
        }
      } catch (error) {
        if (!isActive) return;
        const message = error instanceof Error ? error.message : 'Unknown error';
        addLog({ en: `API request failed: ${message}`, zh: `API 请求失败: ${message}` }, 'WARN');
      } finally {
        if (isActive) setIsFetching(false);
      }
    };

    requestData();
    const interval = setInterval(requestData, 15000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [config, addLog]);

  useEffect(() => {
    if (!config) return;
    if (config.readKey === 'CHANGE_ME_READ_KEY') {
      addLog({
        en: 'config.json still uses the placeholder read key. Update it to connect to your backend.',
        zh: 'config.json 仍在使用示例读密钥，请更新为实际后端凭证。'
      }, 'WARN');
    }
  }, [config, addLog]);

  useEffect(() => {
    const offline = services.some(s => s.status === 'OFFLINE');
    const degraded = services.some(s => s.status === 'DEGRADED');
    if (offline) setGlobalStatus('OFFLINE');
    else if (degraded) setGlobalStatus('DEGRADED');
    else setGlobalStatus('OPERATIONAL');
  }, [services]);

  return (
    <>
      <StarryQuicksand />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '3rem', 
        position: 'relative', 
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* HEADER */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '4rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <GlitchText text={t.title} subtext={t.subtitle} />
          </div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {/* Language Switcher - Sharp Design */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
              style={{
                background: 'transparent',
                border: `1px solid ${HexColor.cyan}`,
                color: HexColor.cyan,
                padding: '0.5rem 1rem',
                fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
                fontSize: '1rem',
                cursor: 'pointer',
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                 e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)';
                 e.currentTarget.style.boxShadow = `0 0 15px ${HexColor.cyan}40`;
              }}
              onMouseLeave={(e) => {
                 e.currentTarget.style.background = 'transparent';
                 e.currentTarget.style.boxShadow = 'none';
              }}
            >
              [ {lang === 'en' ? 'EN' : '中文'} ]
            </button>

            {config && (
              <span style={{
                fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
                fontSize: '0.8rem',
                color: isFetching ? HexColor.yellow : HexColor.cyan,
                border: `1px solid ${isFetching ? HexColor.yellow : HexColor.cyan}`,
                padding: '0.25rem 0.75rem',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                {isFetching ? 'SYNCING API' : 'API LINKED'}
              </span>
            )}

            <GlobalStatusIndicator status={globalStatus} lang={lang} />
          </div>
        </header>

        {isConfigLoading && (
          <div style={{
            border: `1px solid ${HexColor.yellow}`,
            color: HexColor.yellow,
            padding: '0.75rem 1rem',
            fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
            marginBottom: '1.5rem'
          }}>
            Loading config.json ... / 正在加载 config.json ...
          </div>
        )}

        {configError && (
          <div style={{
            border: `1px solid ${HexColor.red}`,
            color: HexColor.red,
            padding: '0.75rem 1rem',
            fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
            marginBottom: '1.5rem'
          }}>
            Config error: {configError}. Ensure public/config.json is present with your API base URL and readKey.
          </div>
        )}

        {/* GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem',
          flex: 1
        }}>
          {services.map(svc => (
            <Card key={svc.id} service={svc} lang={lang} />
          ))}
        </div>

        {/* FOOTER / LOGS */}
        <Terminal logs={logs} lang={lang} />
        
        <footer style={{ 
          marginTop: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          opacity: 0.6, 
          fontSize: '0.7rem', 
          fontFamily: '"Share Tech Mono", "Noto Sans SC", monospace',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '1rem'
        }}>
          <div>{t.secure}: TLS v1.3 // {t.node}: ALPHA-7</div>
          <div>{t.coords}: 34.0522, -118.2437 // {t.time}: {new Date().toISOString()}</div>
        </footer>

      </div>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);