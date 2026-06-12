import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetectionVisual from '../../components/DetectionVisual/DetectionVisual';
import CircuitBg from '../../components/CircuitBg/CircuitBg';
import NeuralBg from '../../components/NeuralBg/NeuralBg';
import FaceWire from '../../components/FaceWire/FaceWire';
import './HomePage.css';

/* ── Scroll reveal: [data-reveal] elemanlarını viewport girince göster ── */
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Sayaç animasyonu ── */
function useCounter(target, { decimals = 0, started = false } = {}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(+(target * eased).toFixed(decimals));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, decimals]);
  return val;
}

function KpiCounter({ value, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const count = useCounter(value, { decimals, started });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const display = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString('tr-TR');

  return (
    <span ref={ref} className={`kpi-val ${className}`}>
      {prefix}{display}{suffix}
    </span>
  );
}

const FEATURES = [
  { icon: '⏱', title: 'Zamansal Analiz',    desc: 'Tek kare yetmez. LSTM 20 ardışık kareyi dizi olarak işler; göz kırpma ritmi, mimik titremesi gibi kareler arası anormallikleri yakalar.' },
  { icon: '🧬', title: 'Transfer Learning',  desc: 'ImageNet\'te önceden eğitilmiş EfficientNet-B0 ağırlıkları donduruldu. 1280 boyutlu zengin görsel özellikler sıfırdan öğrenme gerekmeden kullanılır.' },
  { icon: '⚖️', title: 'Sınıf Dengesi',      desc: 'Veri setinde sahte/gerçek oranı 4:1\'dir. BCEWithLogitsLoss\'ta pos_weight ile bu dengesizlik telafi edildi; model her iki sınıfı dengeli öğrendi.' },
  { icon: '🔬', title: 'Şeffaf Karar',       desc: 'Model kararını destekleyen 20 yüz karesi arayüzde görselleştirilir. Ham olasılık skoru ve güven aralığı kullanıcıya açıkça gösterilir.' },
];

const SIGNS = [
  { icon: '👁',  color: '#00d4ff', title: 'Göz Kırpma Düzensizliği', desc: 'DeepFake modeller göz kırpma ritmini doğal yeniden üretemez. Bazen hiç kırpmaz, bazen anormal aralıklarla kırpar.' },
  { icon: '✨',  color: '#10b981', title: 'Işık Uyumsuzluğu',         desc: 'Yapıştırılan yüzün ışık kaynağı ortamla uyuşmaz. Kenar bölgelerde renk sızması ve gölge hatası oluşur.' },
  { icon: '🌀',  color: '#f59e0b', title: 'Kenar Bozulması',           desc: 'Yüz-arka plan sınırında pikselleşme görülür. Saç ve kulak bölgelerinde net bir ayrım yapılamaz.' },
  { icon: '😶',  color: '#a855f7', title: 'Mimik Titremesi',           desc: 'Gerçek yüz kaslarının koordineli hareketi yerine kare kare tutarsız titreme ve form değişimi gözlenir.' },
  { icon: '🎨',  color: '#60a5fa', title: 'Doku Yapaylığı',            desc: 'Gerçek derinin gözenek ve kırışık dokusu kaybolur; aşırı pürüzsüz, plastik bir yüzey oluşur.' },
  { icon: '🔄',  color: '#06b6d4', title: 'Zamansal Kopukluk',         desc: 'Kare kare incelendiğinde yüz şekli, rengi veya pozisyonu tutarsız biçimde değişir. Modelimizin asıl hedeflediği belirti budur.' },
];

const STEPS = [
  { n: '01', t: 'Video Yükleme',     d: 'MP4, AVI veya MOV formatında video yüklenir. H.264 dışı formatlar otomatik dönüştürülür.' },
  { n: '02', t: 'MTCNN ile Tespit',  d: 'Her 5. kare işlenir, en büyük yüz %15 padding ile kırpılır ve 224×224\'e yeniden boyutlandırılır.' },
  { n: '03', t: 'CNN Özellikleri',   d: 'EfficientNet-B0 her kareden 1280 boyutlu özellik vektörü çıkarır. Ağırlıklar ImageNet\'te önceden eğitilmiştir.' },
  { n: '04', t: 'LSTM Analizi',      d: '20 karelik dizi LSTM\'e verilir; kareler arası geçiş anormallikleri ve temporal tutarsızlıklar modellenir.' },
  { n: '05', t: 'Karar',             d: 'Sigmoid aktivasyonu ile [0,1] olasılık üretilir. 0.5 eşiği ile Gerçek/Sahte kararı verilir.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div className="home">

      {/* ══════════ HERO ══════════ */}
      <section className="hero">
        <CircuitBg />
        <div className="hero-glow-tl"/>
        <div className="hero-glow-br"/>

        <div className="hero-inner">

          {/* ── Left col ── */}
          <div className="hero-left">
            <div className="hero-chip">
              <span className="chip-pulse"/>
              EfficientNet-B0 + LSTM &nbsp;·&nbsp; Celeb-DF v2
            </div>

            <h1 className="hero-h1">
              <span className="hero-h1-line">Gördüğünüze</span>
              <span className="hero-h1-line hero-h1-accent">Güveniyor</span>
              <span className="hero-h1-line">musunuz?</span>
            </h1>

            <p className="hero-p">
              DeepFake teknolojisi artık insan gözünü kolayca yanıltıyor.
              Bu sistem yalnızca tek kareye bakmaz — 20 ardışık kareyi
              zamansal olarak analiz ederek kareler arası tutarsızlıkları yakalar.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/analyze')}>
                Videoyu Analiz Et
                <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-ghost" onClick={() => document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>
                Nasıl Çalışır?
              </button>
            </div>

            <div className="hero-kpis">
              <div className="kpi">
                <KpiCounter value={0.8783} decimals={4} className="kpi-amber" />
                <span className="kpi-lbl">Test AUC</span>
              </div>
              <div className="kpi-divider"/>
              <div className="kpi">
                <KpiCounter value={93} prefix="%" className="kpi-green" />
                <span className="kpi-lbl">Gerçek Tespit</span>
              </div>
              <div className="kpi-divider"/>
              <div className="kpi">
                <KpiCounter value={2743} className="kpi-cyan" />
                <span className="kpi-lbl">Eğitim Videosu</span>
              </div>
              <div className="kpi-divider"/>
              <div className="kpi">
                <KpiCounter value={94} prefix="%" />
                <span className="kpi-lbl">Sahte Precision</span>
              </div>
            </div>
          </div>

          {/* ── Right col — Detection Visual ── */}
          <div className="hero-right">
            <DetectionVisual />
          </div>

        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="section">
        <div className="section-inner">
          <div className="sec-head" data-reveal>
            <span className="sec-tag">Sistem Özellikleri</span>
            <h2 className="sec-title">Neden Farklı?</h2>
            <p className="sec-sub">Geleneksel yöntemler tekil kare analizi yapar. Bu sistem zamansal bağlamı da değerlendirir.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card" data-reveal data-delay={i + 1}>
                <div className="feature-icon-wrap">
                  <span className="feature-icon">{f.icon}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ DEEPFAKE SIGNS ══════════ */}
      <section className="section section-alt">
        <NeuralBg />
        <div className="signs-face-bg">
          <FaceWire />
        </div>
        <div className="section-inner">
          <div className="sec-head" data-reveal>
            <span className="sec-tag sec-tag-warn">DeepFake Belirtileri</span>
            <h2 className="sec-title">Model Neye Bakıyor?</h2>
            <p className="sec-sub">İnsan gözünün kaçırdığı ama LSTM'nin yakaladığı 6 kritik belirti</p>
          </div>
          <div className="signs-wrap">
            <div className="signs-grid">
              {SIGNS.map((s, i) => (
                <div key={s.title} className="sign-card" data-reveal data-delay={i + 1}>
                  <div className="sign-icon-wrap" style={{ background: `${s.color}18`, border: `1px solid ${s.color}44` }}>
                    <span className="sign-icon">{s.icon}</span>
                  </div>
                  <div>
                    <h4 className="sign-title">{s.title}</h4>
                    <p className="sign-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="signs-aside">
              <div className="aside-box" data-reveal data-delay="1">
                <div className="aside-number">2019</div>
                <p className="aside-text">DeepFake kalitesinin patlama yaptığı yıl. O tarihten bu yana yüzler insan gözüyle ayırt edilemez hale geldi.</p>
              </div>
              <div className="aside-box" data-reveal data-delay="2">
                <div className="aside-number">%98</div>
                <p className="aside-text">Son nesil modellerin ürettiği sahte içeriklerin gönüllülerce gerçek sanılma oranı (MIT çalışması).</p>
              </div>
              <div className="aside-box aside-box--amber" data-reveal data-delay="3">
                <h4 className="aside-cta-title">Videonuzu test edin</h4>
                <p className="aside-text">Sisteme bir video yükleyin, model 20 kareyi analiz ederek saniyeler içinde karar verir.</p>
                <button className="btn-primary btn-sm" onClick={() => navigate('/analyze')}>
                  Analiz Sayfasına Git →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="section" id="how">
        <div className="section-inner">
          <div className="sec-head" data-reveal>
            <span className="sec-tag">Süreç</span>
            <h2 className="sec-title">5 Adımda Tespit</h2>
            <p className="sec-sub">Video yüklenmesinden kararın verilmesine kadar tam pipeline</p>
          </div>
          <div className="timeline">
            {STEPS.map((s, i) => (
              <div key={s.n} className="tl-row" data-reveal data-delay={i + 1}>
                <div className="tl-left-col">
                  <div className="tl-badge">{s.n}</div>
                  {i < STEPS.length - 1 && <div className="tl-connector"/>}
                </div>
                <div className="tl-card">
                  <h3 className="tl-title">{s.t}</h3>
                  <p className="tl-desc">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="cta-section">
        <div className="cta-inner" data-reveal>
          <div className="cta-bg-line"/>
          <p className="cta-eyebrow">Hazır mısınız?</p>
          <h2 className="cta-title">Videonuzu Şimdi Analiz Edin</h2>
          <p className="cta-sub">Model 20 kareyi inceleyerek saniyeler içinde sahte/gerçek kararını verir</p>
          <button className="btn-primary btn-lg" onClick={() => navigate('/analyze')}>
            Analiz Sayfasına Git
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </section>

    </div>
  );
}
