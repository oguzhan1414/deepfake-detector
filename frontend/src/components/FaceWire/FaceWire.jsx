import React, { useEffect, useRef } from 'react';
import './FaceWire.css';

const W = 400, H = 520, CX = W / 2, CY = H / 2;
const SCALE = 155, FOV = 4.2;
const LATS = 12, LONS = 16;

const RINGS = [];
for (let i = 0; i <= LATS; i++) {
  const lat = (i / LATS) * Math.PI - Math.PI / 2;
  const ring = [];
  for (let j = 0; j <= LONS; j++) {
    const lon = (j / LONS) * Math.PI * 2;
    const cl  = Math.cos(lat);
    ring.push([
      cl * Math.cos(lon) * 0.86,
      Math.sin(lat)      * 1.28,
      cl * Math.sin(lon) * 0.94,
    ]);
  }
  RINGS.push(ring);
}

const FEATURES = [
  { pts: [[-0.40,0.30,0.82],[-0.28,0.37,0.91],[-0.15,0.35,0.95]], lw:1.4, a:0.9 },
  { pts: [[ 0.40,0.30,0.82],[ 0.28,0.37,0.91],[ 0.15,0.35,0.95]], lw:1.4, a:0.9 },
  { pts: [[-0.40,0.18,0.86],[-0.27,0.24,0.93],[-0.16,0.21,0.96],[-0.12,0.16,0.97]], lw:1.3, a:1 },
  { pts: [[ 0.40,0.18,0.86],[ 0.27,0.24,0.93],[ 0.16,0.21,0.96],[ 0.12,0.16,0.97]], lw:1.3, a:1 },
  { pts: [[ 0,0.18,0.98],[ 0,0.04,1.0],[-0.07,-0.10,0.98],[0.07,-0.10,0.98]], lw:1.1, a:0.8 },
  { pts: [[-0.22,-0.31,0.93],[-0.10,-0.27,0.97],[0,-0.26,0.98],[0.10,-0.27,0.97],[0.22,-0.31,0.93]], lw:1.4, a:0.9 },
];

const MARKS = [
  { pt:[0,0.42,0.90],      r:3   },
  { pt:[-0.26,0.20,0.94],  r:2.5 },
  { pt:[ 0.26,0.20,0.94],  r:2.5 },
  { pt:[0,-0.06,1.0 ],     r:3.5 },
  { pt:[0,-0.27,0.97 ],    r:2.5 },
];

function proj([x, y, z], ry) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const rx =  x * c + z * s;
  const rz = -x * s + z * c;
  const sc = FOV / (FOV + rz + 1.6);
  return [rx * SCALE * sc + CX, -y * SCALE * sc + CY, rz];
}

export default function FaceWire() {
  const ref = useRef(null);

  useEffect(() => {
    const cv  = ref.current;
    const ctx = cv.getContext('2d');
    cv.width  = W;
    cv.height = H;
    let id, t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const ry = Math.sin(t * 0.38) * 0.26;

      /* Kafes — yatay halkalar */
      ctx.shadowColor = 'rgba(0,212,255,0.3)';
      ctx.shadowBlur  = 3;
      for (let i = 0; i < RINGS.length; i += 2) {
        const ring = RINGS[i];
        for (let j = 0; j < LONS; j++) {
          const a1 = proj(ring[j], ry);
          const a2 = proj(ring[(j + 1) % LONS], ry);
          const az = (a1[2] + a2[2]) / 2;
          if (az < -0.12) continue;
          const al = Math.max(0, (az + 0.12) / 1.12) * 0.38;
          ctx.beginPath();
          ctx.moveTo(a1[0], a1[1]);
          ctx.lineTo(a2[0], a2[1]);
          ctx.strokeStyle = `rgba(0,212,255,${al})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      /* Kafes — dikey meridyenler */
      ctx.shadowBlur = 0;
      for (let j = 0; j < LONS; j += 2) {
        for (let i = 0; i < RINGS.length - 1; i++) {
          const a1 = proj(RINGS[i][j], ry);
          const a2 = proj(RINGS[i + 1][j], ry);
          const az = (a1[2] + a2[2]) / 2;
          if (az < -0.12) continue;
          const al = Math.max(0, (az + 0.12) / 1.12) * 0.28;
          ctx.beginPath();
          ctx.moveTo(a1[0], a1[1]);
          ctx.lineTo(a2[0], a2[1]);
          ctx.strokeStyle = `rgba(0,212,255,${al})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      /* Yüz özellikleri */
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(0,212,255,0.5)';
      FEATURES.forEach(f => {
        const pts = f.pts.map(p => proj(p, ry));
        if (pts.some(p => p[2] < -0.05)) return;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
        ctx.strokeStyle = `rgba(0,212,255,${f.a})`;
        ctx.lineWidth = f.lw;
        ctx.stroke();
      });

      /* Landmark noktalar — gradient yerine basit daire */
      ctx.shadowBlur = 10;
      MARKS.forEach(({ pt, r }) => {
        const [px, py, pz] = proj(pt, ry);
        if (pz < -0.05) return;
        const pulse = 1 + Math.sin(t * 2.2 + px * 0.04) * 0.25;
        ctx.beginPath();
        ctx.arc(px, py, r * 2.2 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,0.12)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,255,1)';
        ctx.shadowBlur = 5;
        ctx.fill();
      });

      /* Tarama çizgisi */
      ctx.shadowBlur = 0;
      const sy = CY + Math.sin(t * 0.55) * SCALE * 1.15;
      const sg = ctx.createLinearGradient(0, sy - 2, 0, sy + 2);
      sg.addColorStop(0,   'rgba(0,212,255,0)');
      sg.addColorStop(0.5, 'rgba(0,212,255,0.45)');
      sg.addColorStop(1,   'rgba(0,212,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 2, W, 4);

      t += 0.016;
      id = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(id);
  }, []);

  return <canvas ref={ref} className="face-wire" />;
}
