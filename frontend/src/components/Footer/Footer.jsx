import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const TECH = [
  { name: 'EfficientNet-B0', cat: 'CNN Backbone',       color: 'blue'   },
  { name: 'LSTM (256 birim)',cat: 'Temporal Analysis',  color: 'purple' },
  { name: 'PyTorch 2.2',    cat: 'Deep Learning',      color: 'orange' },
  { name: 'facenet-pytorch',cat: 'Yüz Tespiti',        color: 'green'  },
  { name: 'FastAPI',        cat: 'Backend API',         color: 'teal'   },
  { name: 'React 19',       cat: 'Frontend',            color: 'blue'   },
  { name: 'timm',           cat: 'Model Zoo',           color: 'gray'   },
  { name: 'Celeb-DF v2',    cat: 'Veri Seti',           color: 'red'    },
];

const PERF = [
  { label: 'Test AUC',       value: '0.8783', good: true },
  { label: 'Test Doğruluğu', value: '%72',    good: null },
  { label: 'Gerçek Recall',  value: '%93',    good: true },
  { label: 'Sahte Precision',value: '%94',    good: true },
  { label: 'Val AUC (best)', value: '0.9286', good: true },
  { label: 'Eğitim Epoch',   value: '8 / 13', good: null },
  { label: 'Eğitim Süresi',  value: '~13 sa', good: null },
  { label: 'Donanım',        value: 'CPU',    good: null },
];

const NAV_LINKS = [
  { label: 'Ana Sayfa',   to: '/' },
  { label: 'Analiz Et',   to: '/analyze' },
  { label: 'Model Bilgisi', to: '/model' },
  { label: 'Hakkında',    to: '/about' },
];

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-body">

        {/* Col 1 — Brand + About */}
        <div className="fcol fcol--wide">
          <div className="footer-brand">
            <div className="footer-logo-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="#f59e0b" strokeWidth="1.5"/>
                <circle cx="18" cy="14" r="5.5" stroke="#f59e0b" strokeWidth="1.5"/>
                <path d="M7 32c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="27" y1="7" x2="32" y2="2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="27" y1="2" x2="32" y2="7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="footer-logo-text">DeepFake<span className="footer-accent">AI</span></span>
              <span className="footer-logo-sub">Tespit Sistemi</span>
            </div>
          </div>
          <p className="footer-about">
            CNN ve LSTM mimarilerini birleştiren hibrit bir derin öğrenme sistemiyle
            sahte videoları tespit eder. EfficientNet-B0 ile görsel özellik çıkarımı,
            LSTM ile zamansal bağımlılık modellemesi yapılır.
          </p>
          <p className="footer-about">
            Celeb-DF v2 veri seti üzerinde eğitilen model, test setinde 0.8783 AUC
            skoru elde etmiştir. Gerçek videoları %93, sahteleri %94 precision ile tanır.
          </p>
          <div className="footer-badges">
            <span className="fbadge fbadge--amber">Test AUC: 0.8783</span>
            <span className="fbadge fbadge--cyan">Celeb-DF v2</span>
            <span className="fbadge fbadge--gray">PyTorch 2.2</span>
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div className="fcol">
          <h4 className="fcol-title">Sayfalar</h4>
          <nav className="footer-nav">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="footer-nav-link">{l.label}</Link>
            ))}
          </nav>

          <h4 className="fcol-title" style={{marginTop: '28px'}}>Kaynaklar</h4>
          <nav className="footer-nav">
            <a href="https://github.com/yuezunli/celeb-deepfakeforensics" target="_blank" rel="noreferrer" className="footer-nav-link footer-nav-link--ext">
              Celeb-DF v2 Dataset ↗
            </a>
            <a href="https://arxiv.org/abs/1905.09505" target="_blank" rel="noreferrer" className="footer-nav-link footer-nav-link--ext">
              EfficientNet Paper ↗
            </a>
            <a href="https://pytorch.org" target="_blank" rel="noreferrer" className="footer-nav-link footer-nav-link--ext">
              PyTorch ↗
            </a>
          </nav>
        </div>

        {/* Col 3 — Tech stack */}
        <div className="fcol">
          <h4 className="fcol-title">Teknoloji Yığını</h4>
          <div className="tech-list">
            {TECH.map(t => (
              <div key={t.name} className={`tech-item tech-item--${t.color}`}>
                <span className="tech-item-name">{t.name}</span>
                <span className="tech-item-cat">{t.cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 4 — Performance + Developer */}
        <div className="fcol">
          <h4 className="fcol-title">Model Performansı</h4>
          <div className="perf-table">
            {PERF.map(p => (
              <div key={p.label} className="perf-row">
                <span className="perf-label">{p.label}</span>
                <span className={`perf-value ${p.good === true ? 'perf--green' : ''}`}>{p.value}</span>
              </div>
            ))}
          </div>

          <h4 className="fcol-title" style={{marginTop: '28px'}}>Geliştirici</h4>
          <div className="dev-card">
            <div className="dev-av">OŞ</div>
            <div className="dev-info">
              <p className="dev-name">Oğuzhan Şekerci</p>
              <p className="dev-meta">Bilgisayar Mühendisliği</p>
              <p className="dev-meta">Bitirme Projesi · 2025–2026</p>
            </div>
          </div>
          <a href="https://github.com/oguzhan1414/deepfake-detector" target="_blank" rel="noreferrer" className="footer-email">
            <svg viewBox="0 0 18 18" fill="none"><path d="M9 1C4.58 1 1 4.58 1 9c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.34c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.88-1.17-.88-1.17-.72-.49.05-.48.05-.48.8.06 1.22.82 1.22.82.71 1.21 1.87.86 2.33.66.07-.52.28-.87.5-1.07-1.77-.2-3.63-.89-3.63-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82A7.6 7.6 0 0 1 9 4.84c.68 0 1.36.09 2 .27 1.52-1.03 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8.01 8.01 0 0 0 17 9c0-4.42-3.58-8-8-8z" fill="currentColor"/></svg>
            github.com/oguzhan1414
          </a>
          <a href="mailto:oguzhansekerci14@gmail.com" className="footer-email">
            <svg viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M1 6.5l8 5 8-5" stroke="currentColor" strokeWidth="1.4"/></svg>
            oguzhansekerci14@gmail.com
          </a>
        </div>

      </div>

      <div className="footer-disclaimer">
        <span>⚠️ Bu sistem araştırma amaçlıdır. Yüksek güven skoru kesin sonuç garantisi vermez. Kritik kararlar için uzman görüşü alınız.</span>
      </div>

      <div className="footer-bottom">
        <span>© 2025–2026 DeepFakeAI — Oğuzhan Şekerci · Bilgisayar Mühendisliği Bitirme Projesi</span>
        <span className="footer-bottom-right">EfficientNet-B0 + LSTM · Celeb-DF v2 · PyTorch 2.2 · React 19</span>
      </div>

    </footer>
  );
}
