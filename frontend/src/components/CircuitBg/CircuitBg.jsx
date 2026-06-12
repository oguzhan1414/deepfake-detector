import React from 'react';
import './CircuitBg.css';

const TRACES = [
  /* sol küme */
  "M -2 160 H 160 V 280 H 340 V 160 H 500",
  "M -2 400 H 220 V 270 H 360 V 400 H 520 V 520",
  "M 80 802 V 640 H 260 V 500 H 400 V 380",
  "M 200 802 V 700 H 360 V 580 H 500 V 460",
  /* sağ küme */
  "M 1442 160 H 1280 V 300 H 1100 V 160 H 960",
  "M 1442 400 H 1280 V 270 H 1120 V 400 H 980 V 520",
  "M 1320 802 V 660 H 1140 V 520 H 1020",
  "M 1180 802 V 720 H 1040 V 600 H 900",
  /* üst */
  "M 500 -2 V 110 H 660 V 240 H 800 V 110 H 960 V -2",
  "M 620 -2 V 160 H 760 V 300 H 900 V 160",
  /* yatay bağlantılar */
  "M 360 380 H 500 V 480 H 640",
  "M 800 400 H 940 V 300 H 1080",
  "M 640 540 H 800 V 420 H 940 V 540",
];

const TRACES_DIM = [
  "M -2 600 H 140 V 480 H 300 V 620 H 460",
  "M 1442 580 H 1360 V 460 H 1200 V 580 H 1080",
  "M 240 -2 V 100 H 400 V 220",
  "M 1200 -2 V 140 H 1060 V 280",
  "M 520 660 H 680 V 760 H 820 V 680",
  "M 420 480 H 560 V 580",
  "M 880 480 H 1020 V 560",
];

const NODES = [
  { x: 160, y: 160 }, { x: 340, y: 160 }, { x: 340, y: 280 }, { x: 500, y: 280 },
  { x: 220, y: 400 }, { x: 360, y: 270 }, { x: 260, y: 500 }, { x: 500, y: 460 },
  { x: 1280, y: 160 }, { x: 1100, y: 160 }, { x: 1100, y: 300 }, { x: 1280, y: 300 },
  { x: 1120, y: 270 }, { x: 980, y: 520 }, { x: 1140, y: 520 },
  { x: 660, y: 110 }, { x: 800, y: 110 }, { x: 800, y: 240 }, { x: 760, y: 160 },
  { x: 500, y: 480 }, { x: 940, y: 300 }, { x: 800, y: 420 }, { x: 640, y: 420 },
];

const PULSE_NODES = [
  { x: 340, y: 280, delay: 0    },
  { x: 1280, y: 300, delay: 0.8 },
  { x: 800, y: 240,  delay: 1.6 },
  { x: 940, y: 300,  delay: 2.4 },
  { x: 500, y: 520,  delay: 3.2 },
];

const FLOW_TRACES = [
  "M -2 160 H 160 V 280 H 340",
  "M 1442 400 H 1280 V 270 H 1120",
  "M 620 -2 V 160 H 760 V 300",
];

export default function CircuitBg() {
  return (
    <svg
      className="circuit-bg"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="cbFade" cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="white" stopOpacity="1"/>
          <stop offset="60%"  stopColor="white" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="cbMask">
          <rect width="100%" height="100%" fill="url(#cbFade)"/>
        </mask>
      </defs>

      <g mask="url(#cbMask)">

        {/* Ana hatlar */}
        <g stroke="rgba(0,212,255,0.22)" strokeWidth="1" fill="none" strokeLinecap="square">
          {TRACES.map((d, i) => <path key={i} d={d}/>)}
        </g>

        {/* Soluk arka plan hatları */}
        <g stroke="rgba(0,212,255,0.08)" strokeWidth="0.8" fill="none" strokeLinecap="square">
          {TRACES_DIM.map((d, i) => <path key={i} d={d}/>)}
        </g>

        {/* Veri akış animasyonları */}
        <g fill="none" strokeLinecap="round">
          {FLOW_TRACES.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="rgba(0,212,255,0.7)"
              strokeWidth="1.5"
              className="circuit-flow"
              style={{ animationDelay: `${i * 1.3}s` }}
            />
          ))}
        </g>

        {/* Normal düğümler */}
        <g fill="rgba(0,212,255,0.4)">
          {NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="2.5"/>
          ))}
        </g>

        {/* Parlak animasyonlu düğümler */}
        {PULSE_NODES.map((n, i) => (
          <g key={i} transform={`translate(${n.x},${n.y})`}>
            <circle r="4" fill="rgba(0,212,255,0.9)"/>
            <circle
              r="4"
              fill="none"
              stroke="rgba(0,212,255,0.5)"
              strokeWidth="1"
              className="circuit-pulse"
              style={{ animationDelay: `${n.delay}s` }}
            />
            <circle
              r="4"
              fill="none"
              stroke="rgba(0,212,255,0.2)"
              strokeWidth="1"
              className="circuit-pulse"
              style={{ animationDelay: `${n.delay + 0.4}s` }}
            />
          </g>
        ))}

        {/* Köşe dekoratif halkalar */}
        <circle cx="0"    cy="0"   r="80" fill="none" stroke="rgba(168,85,247,0.08)" strokeWidth="1"/>
        <circle cx="1440" cy="0"   r="80" fill="none" stroke="rgba(0,212,255,0.08)"  strokeWidth="1"/>
        <circle cx="0"    cy="800" r="60" fill="none" stroke="rgba(0,212,255,0.06)"  strokeWidth="1"/>
        <circle cx="1440" cy="800" r="60" fill="none" stroke="rgba(168,85,247,0.06)" strokeWidth="1"/>

      </g>
    </svg>
  );
}
