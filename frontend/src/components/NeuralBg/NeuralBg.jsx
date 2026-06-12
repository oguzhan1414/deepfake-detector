import React, { useEffect, useRef } from 'react';
import './NeuralBg.css';

const NODE_COUNT = 70;
const MAX_DIST   = 155;
const SPEED      = 0.3;

export default function NeuralBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width  = r.width  || window.innerWidth;
      canvas.height = r.height || 600;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Düğümler ── */
    const nodes = Array.from({ length: NODE_COUNT }, () => {
      const purple = Math.random() < 0.18;
      return {
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r:  Math.random() * 1.8 + 0.8,
        c:  purple ? [168, 85, 247] : [0, 212, 255],
        a:  Math.random() * 0.45 + 0.25,
      };
    });

    /* ── Işık gezgini ── */
    const pulses = [];

    const addPulse = () => {
      const i = Math.floor(Math.random() * NODE_COUNT);
      const src = nodes[i];
      let bestJ = -1, bestD = Infinity;
      nodes.forEach((n, j) => {
        if (j === i) return;
        const d = Math.hypot(n.x - src.x, n.y - src.y);
        if (d < MAX_DIST && d < bestD) { bestD = d; bestJ = j; }
      });
      if (bestJ >= 0) pulses.push({ i, j: bestJ, t: 0, speed: Math.random() * 0.015 + 0.015 });
    };

    let tick = 0;

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Hareket */
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      /* Bağlantı çizgileri */
      for (let a = 0; a < NODE_COUNT; a++) {
        for (let b = a + 1; b < NODE_COUNT; b++) {
          const dx = nodes[a].x - nodes[b].x;
          const dy = nodes[a].y - nodes[b].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / MAX_DIST) * 0.13})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }

      /* Düğüm noktaları */
      nodes.forEach(n => {
        const [r, g, b] = n.c;
        /* hafif parlama halkası */
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grd.addColorStop(0, `rgba(${r},${g},${b},${n.a * 0.6})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        /* merkez nokta */
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${n.a})`;
        ctx.fill();
      });

      /* Işık gezginleri */
      if (tick % 40 === 0) addPulse();
      if (tick % 120 === 0) addPulse(); /* ekstra yoğunluk */

      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(k, 1); continue; }

        const src = nodes[p.i];
        const dst = nodes[p.j];
        const px  = src.x + (dst.x - src.x) * p.t;
        const py  = src.y + (dst.y - src.y) * p.t;

        /* parlak iz */
        const trail = ctx.createRadialGradient(px, py, 0, px, py, 7);
        trail.addColorStop(0, 'rgba(0,212,255,0.95)');
        trail.addColorStop(0.4, 'rgba(0,212,255,0.3)');
        trail.addColorStop(1, 'rgba(0,212,255,0)');
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = trail;
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-bg" />;
}
