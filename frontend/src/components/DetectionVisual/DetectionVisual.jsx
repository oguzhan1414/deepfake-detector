import React, { useEffect, useState } from 'react';
import './DetectionVisual.css';

const CYCLE = [
  { label: 'Yüz Tespiti Yapılıyor',   pct: 22,  phase: 'scan'    },
  { label: 'Özellikler Çıkarılıyor',   pct: 47,  phase: 'extract' },
  { label: 'Zamansal Analiz',          pct: 71,  phase: 'analyze' },
  { label: 'Karar Veriliyor',          pct: 91,  phase: 'decide'  },
  { label: 'SAHTE TESPİT EDİLDİ',      pct: 100, phase: 'result'  },
];

const POINTS = [
  { cx: '50%', cy: '20%' },
  { cx: '32%', cy: '36%' },
  { cx: '68%', cy: '36%' },
  { cx: '50%', cy: '50%' },
  { cx: '36%', cy: '64%' },
  { cx: '64%', cy: '64%' },
  { cx: '50%', cy: '76%' },
];

const METRICS = [
  { k: 'KARE',  v: '20/20'   },
  { k: 'FPS',   v: '25.0'    },
  { k: 'RES',   v: '224px'   },
  { k: 'MODEL', v: 'EfNet-B0', amber: true },
  { k: 'LSTM',  v: '256u'    },
  { k: 'SEQ',   v: '20T'     },
];

const READS = [
  { k: 'temporal_consistency', v: '0.31', dir: '↓', cls: 'low'  },
  { k: 'blink_regularity',     v: '0.24', dir: '↓', cls: 'low'  },
  { k: 'facial_boundary',      v: '0.58', dir: '⚠', cls: 'warn' },
  { k: 'texture_anomaly',      v: '0.76', dir: '↑', cls: 'low'  },
  { k: 'lstm_confidence',      v: '0.914',dir: '↑', cls: 'high' },
  { k: 'deepfake_prob',        v: '0.914',dir: '↑', cls: 'high' },
];

export default function DetectionVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % CYCLE.length), 1900);
    return () => clearInterval(t);
  }, []);

  const cur    = CYCLE[step];
  const isHit  = cur.phase === 'result';

  return (
    <div className="dv">
      <div className="dv-grid-bg"/>

      <div className={`dv-panel ${isHit ? 'dv-panel--alert' : ''}`}>

        {/* ── topbar ── */}
        <div className="dv-top">
          <div className="dv-dots"><span/><span/><span/></div>
          <span className="dv-top-title">DEEPFAKE_SCANNER_v2.1</span>
          <div className="dv-top-right">
            <span className="dv-coord">LAT: 41.0082° N</span>
            <span className="dv-coord">LON: 28.9784° E</span>
            <span className={`dv-live ${isHit ? 'dv-live--alert' : ''}`}>
              <span className="dv-live-dot"/>
              {isHit ? 'ALERT' : 'LIVE'}
            </span>
          </div>
        </div>

        {/* ── main body ── */}
        <div className="dv-body">

          {/* face area */}
          <div className="dv-face-wrap">
            <div className={`dv-frame ${isHit ? 'dv-frame--red' : ''}`}>
              <span className="dv-c dv-c--tl"/><span className="dv-c dv-c--tr"/>
              <span className="dv-c dv-c--bl"/><span className="dv-c dv-c--br"/>

              {/* face SVG */}
              <svg className="dv-svg" viewBox="0 0 160 190" fill="none">
                <ellipse cx="80" cy="78" rx="50" ry="62" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 5" opacity=".3"/>
                <ellipse cx="58" cy="70" rx="9"  ry="6"  stroke="#f59e0b" strokeWidth="1.2" opacity=".55"/>
                <ellipse cx="102" cy="70" rx="9" ry="6"  stroke="#f59e0b" strokeWidth="1.2" opacity=".55"/>
                <path d="M80 80 L76 94 L84 94" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity=".45"/>
                <path d="M66 110 Q80 118 94 110" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
                <path d="M32 90 Q34 136 80 148 Q126 136 128 90" stroke="#f59e0b" strokeWidth=".8" opacity=".2" strokeLinecap="round"/>
                <line x1="30" y1="80" x2="130" y2="80" stroke="#f59e0b" strokeWidth=".5" strokeDasharray="2 6" opacity=".15"/>
                <line x1="80" y1="20" x2="80" y2="160" stroke="#f59e0b" strokeWidth=".5" strokeDasharray="2 6" opacity=".15"/>
                <line x1="30" y1="110" x2="130" y2="110" stroke="#22d3ee" strokeWidth=".4" strokeDasharray="3 8" opacity=".12"/>
              </svg>

              {/* points */}
              {POINTS.map((p, i) => (
                <div key={i} className="dv-pt" style={{ left: p.cx, top: p.cy, animationDelay: `${i * 0.18}s` }}>
                  <span className="dv-pt-ring"/>
                </div>
              ))}

              {/* scan line */}
              {!isHit && <div className="dv-scan"/>}

              {/* result overlay */}
              {isHit && (
                <div className="dv-overlay">
                  <span className="dv-overlay-label">SAHTE</span>
                  <span className="dv-overlay-conf">%91.4 güven</span>
                </div>
              )}
            </div>

            {/* bottom label under face */}
            <div className="dv-face-label">
              <span className={`dv-status-pill ${isHit ? 'pill--red' : 'pill--amber'}`}>
                {isHit ? '⚠ DEEPFAKE DETECTED' : '● SCANNING SUBJECT'}
              </span>
            </div>
          </div>

          {/* right panel */}
          <div className="dv-right">

            {/* metrics grid */}
            <div className="dv-metrics">
              {METRICS.map(m => (
                <div key={m.k} className="dv-metric">
                  <span className="dv-mk">{m.k}</span>
                  <span className={`dv-mv ${m.amber ? 'dv-mv--amber' : ''}`}>{m.v}</span>
                </div>
              ))}
            </div>

            {/* readout */}
            <div className="dv-readout">
              <div className="dv-readout-head">FEATURE ANALYSIS</div>
              {READS.map(r => (
                <div key={r.k} className="dv-read-row">
                  <span className="dv-read-key">{r.k}</span>
                  <span className={`dv-read-val dv-rv--${r.cls}`}>{r.v} {r.dir}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── progress ── */}
        <div className="dv-footer">
          <div className="dv-bar-wrap">
            <div className="dv-bar">
              <div className={`dv-bar-fill ${isHit ? 'dv-bar-fill--red' : ''}`} style={{ width: `${cur.pct}%` }}/>
            </div>
          </div>
          <div className="dv-footer-row">
            <span className={`dv-step-label ${isHit ? 'dv-step--red' : ''}`}>{cur.label}</span>
            <span className="dv-pct-val">{cur.pct}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
