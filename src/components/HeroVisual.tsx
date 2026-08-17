"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Dominant hero visual — original instrument geometry, not a product mark. */
export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="hero-visual" aria-hidden="true">
      <motion.svg
        viewBox="0 0 640 480"
        initial={reduce ? false : { opacity: 0.65 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9EC5FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#0A64D8" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="glow" cx="48%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#0A64D8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#070B12" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="640" height="480" fill="#070B12" />
        <rect width="640" height="480" fill="url(#glow)" />

        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="40"
            x2="600"
            y1={70 + i * 48}
            y2={70 + i * 48}
            stroke="rgba(232,240,255,0.09)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`v-${i}`}
            y1="40"
            y2="440"
            x1={60 + i * 56}
            x2={60 + i * 56}
            stroke="rgba(232,240,255,0.07)"
            strokeWidth="1"
          />
        ))}

        <path
          d="M160 150 L320 120 L470 170 L400 280 L240 260 Z M240 260 L180 360 M400 280 L500 340"
          fill="rgba(10,100,216,0.08)"
          stroke="url(#beam)"
          strokeWidth="2"
        />

        <motion.g
          initial={reduce ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          <circle cx="160" cy="150" r="11" fill="#58A6FF" />
          <circle cx="320" cy="120" r="9" fill="#9EC5FF" />
          <circle cx="470" cy="170" r="12" fill="#0A64D8" />
          <circle cx="240" cy="260" r="10" fill="#7EB6FF" />
          <circle cx="400" cy="280" r="13" fill="#58A6FF" />
          <circle cx="180" cy="360" r="9" fill="#9EC5FF" />
          <circle cx="500" cy="340" r="10" fill="#7EB6FF" />
        </motion.g>

        <rect
          x="72"
          y="392"
          width="188"
          height="36"
          rx="6"
          fill="rgba(232,240,255,0.08)"
          stroke="rgba(232,240,255,0.22)"
        />
        <text
          x="88"
          y="415"
          fill="#C5D7F0"
          fontFamily="ui-monospace, monospace"
          fontSize="12"
        >
          SYSTEM MAP · LIVE
        </text>
      </motion.svg>
    </div>
  );
}
