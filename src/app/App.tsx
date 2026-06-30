import { useEffect, useRef, useState } from "react";

const START_DATE = new Date(2026, 5, 14);

function daysSince(start: Date): number {
  const now = new Date();
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(Math.round((b.getTime() - a.getTime()) / 86400000), 0);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Seeded random for consistent layout
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface FlowerData {
  x: number;
  height: number;
  sway: number;
  colorIdx: number;
  bloomScale: number;
  hasBoom: boolean;
  variety: number;
  animDelay: number;
}

function buildFlowers(days: number): FlowerData[] {
  const slots = 11;
  const spacing = 560 / (slots + 1);
  const flowers: FlowerData[] = [];
  for (let i = 0; i < slots; i++) {
    const growthDay = days - i * 3;
    if (growthDay <= 0) continue;
    const x = spacing * (i + 1) + (seededRand(i * 7) - 0.5) * 18;
    const height = Math.min(24 + growthDay * 3.8, 160);
    const sway = (i % 2 === 0 ? 1 : -1) * (6 + seededRand(i * 3) * 18);
    const bloomReady = growthDay >= 16;
    const bloomScale = bloomReady ? Math.min(0.65 + growthDay * 0.008, 1.2) : 0;
    flowers.push({
      x,
      height,
      sway,
      colorIdx: i,
      bloomScale,
      hasBoom: bloomReady,
      variety: i % 3,
      animDelay: seededRand(i * 11) * 2,
    });
  }
  return flowers;
}

const BLOOM_COLORS = [
  ["#f4a8b8", "#f6e2b8"],
  ["#f7c9a8", "#fef3c7"],
  ["#e98ea0", "#f6e2b8"],
  ["#c4a8d4", "#f6e2b8"],
  ["#f0b3c4", "#fce7d6"],
  ["#d4b8e0", "#f6e2b8"],
];

function GardenSVG({ flowers }: { flowers: FlowerData[] }) {
  const svgNS = "http://www.w3.org/2000/svg";

  // Generate grass blades
  const grassBlades = Array.from({ length: 38 }, (_, i) => {
    const gx = (i / 37) * 560 + (seededRand(i * 17) - 0.5) * 8;
    const gh = 10 + seededRand(i * 13) * 22;
    const gsway = (seededRand(i * 5) - 0.5) * 12;
    const delay = seededRand(i * 9) * 2.5;
    return { gx, gh, gsway, delay };
  });

  return (
    <svg
      viewBox="0 0 560 240"
      preserveAspectRatio="xMidYMax meet"
      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "65%" }}
    >
      <defs>
        <radialGradient id="groundSheen" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="softBloom">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ground surface highlight */}
      <ellipse cx="280" cy="238" rx="290" ry="18" fill="url(#groundSheen)" />

      {/* Back grass layer (darker, smaller) */}
      {grassBlades.slice(0, 20).map((b, i) => (
        <g key={`bg-grass-${i}`} style={{ animationDelay: `${b.delay}s` }}>
          <path
            d={`M ${b.gx} 240 Q ${b.gx + b.gsway * 0.5} ${240 - b.gh * 0.5} ${b.gx + b.gsway} ${240 - b.gh}`}
            stroke="#4a6b3a"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
            className="grass-sway"
            style={{ transformOrigin: `${b.gx}px 240px`, animationDelay: `${b.delay}s` }}
          />
        </g>
      ))}

      {/* Flowers */}
      {flowers.map((f, idx) => {
        const baseY = 236;
        const topY = baseY - f.height;
        const ctrlX = f.x + f.sway;
        const [petalColor, centerColor] = BLOOM_COLORS[f.colorIdx % BLOOM_COLORS.length];
        const tipX = f.x + f.sway * 0.45;

        return (
          <g key={idx} className="flower-group" style={{ animationDelay: `${f.animDelay}s` }}>
            {/* Stem */}
            <path
              d={`M ${f.x} ${baseY} Q ${ctrlX} ${baseY - f.height * 0.55} ${tipX} ${topY}`}
              stroke="#5d7a4a"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              style={{ transformOrigin: `${f.x}px ${baseY}px`, animationDelay: `${f.animDelay}s` }}
              className="stem-sway"
            />

            {/* Leaves */}
            {f.height > 45 && (
              <>
                <path
                  d={`M ${f.x} ${baseY - f.height * 0.38} q -16 -5 -20 7 q 14 3 20 -7 z`}
                  fill="#6f8f56"
                  opacity="0.9"
                />
                <path
                  d={`M ${ctrlX} ${baseY - f.height * 0.62} q 16 -5 20 7 q -14 3 -20 -7 z`}
                  fill="#7ea062"
                  opacity="0.85"
                />
              </>
            )}

            {/* Bloom */}
            {f.hasBoom && f.bloomScale > 0 ? (
              <g transform={`translate(${tipX}, ${topY}) scale(${f.bloomScale})`} filter="url(#softBloom)">
                {f.variety === 0 &&
                  Array.from({ length: 7 }).map((_, p) => {
                    const angle = (p / 7) * Math.PI * 2;
                    const px = Math.cos(angle) * 8;
                    const py = Math.sin(angle) * 8;
                    return (
                      <ellipse
                        key={p}
                        cx={px}
                        cy={py}
                        rx="6.5"
                        ry="4"
                        transform={`rotate(${(angle * 180) / Math.PI} ${px} ${py})`}
                        fill={petalColor}
                        opacity="0.92"
                      />
                    );
                  })}
                {f.variety === 1 &&
                  Array.from({ length: 5 }).map((_, p) => {
                    const angle = (p / 5) * Math.PI * 2 - Math.PI / 2;
                    const px = Math.cos(angle) * 9;
                    const py = Math.sin(angle) * 9;
                    return (
                      <ellipse
                        key={p}
                        cx={px * 0.5}
                        cy={py * 0.5}
                        rx="9"
                        ry="5"
                        transform={`rotate(${(angle * 180) / Math.PI} ${px * 0.5} ${py * 0.5})`}
                        fill={petalColor}
                        opacity="0.88"
                      />
                    );
                  })}
                {f.variety === 2 &&
                  Array.from({ length: 8 }).map((_, p) => {
                    const angle = (p / 8) * Math.PI * 2;
                    const px = Math.cos(angle) * 7;
                    const py = Math.sin(angle) * 7;
                    return (
                      <ellipse
                        key={p}
                        cx={px}
                        cy={py}
                        rx="5"
                        ry="3.5"
                        transform={`rotate(${(angle * 180) / Math.PI} ${px} ${py})`}
                        fill={petalColor}
                        opacity="0.9"
                      />
                    );
                  })}
                <circle r="4.5" fill={centerColor} />
                <circle r="2" fill="rgba(255,255,255,0.5)" />
              </g>
            ) : f.height > 24 ? (
              <g transform={`translate(${tipX}, ${topY})`}>
                <ellipse cx="0" cy="-2" rx="4" ry="6" fill="#d4889a" opacity="0.85" />
                <ellipse cx="0" cy="-2" rx="2.5" ry="4" fill="#e98ea0" opacity="0.7" />
              </g>
            ) : null}
          </g>
        );
      })}

      {/* Front grass layer */}
      {grassBlades.slice(20).map((b, i) => (
        <path
          key={`fg-grass-${i}`}
          d={`M ${b.gx} 240 Q ${b.gx + b.gsway * 0.6} ${240 - b.gh * 0.6} ${b.gx + b.gsway} ${240 - b.gh}`}
          stroke="#7ea062"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.75"
          className="grass-sway"
          style={{ transformOrigin: `${b.gx}px 240px`, animationDelay: `${b.delay + 0.3}s` }}
        />
      ))}

      {/* Small ground wildflowers */}
      {[80, 200, 350, 470].map((wx, i) => (
        <g key={`wild-${i}`} transform={`translate(${wx}, 230)`}>
          {Array.from({ length: 5 }).map((_, p) => {
            const a = (p / 5) * Math.PI * 2;
            return (
              <circle
                key={p}
                cx={Math.cos(a) * 3.5}
                cy={Math.sin(a) * 3.5}
                r="2.2"
                fill={["#f4a8b8", "#f7c9a8", "#c4a8d4", "#b8d4a8"][i]}
                opacity="0.8"
              />
            );
          })}
          <circle r="1.8" fill="#f6e2b8" />
        </g>
      ))}
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    left: seededRand(i * 37) * 100,
    top: seededRand(i * 23) * 80,
    size: 1 + seededRand(i * 41) * 1.5,
    opacity: 0.3 + seededRand(i * 13) * 0.6,
    delay: seededRand(i * 7) * 4,
    duration: 2 + seededRand(i * 17) * 3,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <div
          key={i}
          className="star-twinkle"
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff8e8",
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function Butterfly({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  return (
    <div
      className="butterfly"
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <ellipse cx="4.5" cy="5" rx="4" ry="5" fill={color} opacity="0.75" className="wing-left" />
        <ellipse cx="13.5" cy="5" rx="4" ry="5" fill={color} opacity="0.75" className="wing-right" />
        <ellipse cx="4.5" cy="10" rx="3" ry="3.5" fill={color} opacity="0.6" className="wing-left" />
        <ellipse cx="13.5" cy="10" rx="3" ry="3.5" fill={color} opacity="0.6" className="wing-right" />
        <line x1="9" y1="2" x2="9" y2="13" stroke="#5d4a4a" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function App() {
  const days = daysSince(START_DATE);
  const flowers = buildFlowers(days);
  const flowerCount = flowers.filter((f) => f.hasBoom).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #faf5f0;
          margin: 0;
          min-height: 100vh;
        }

        @keyframes twinkle {
          0%, 100% { opacity: var(--base-opacity, 0.5); transform: scale(1); }
          50% { opacity: calc(var(--base-opacity, 0.5) * 0.3); transform: scale(0.7); }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1.5deg); }
          75% { transform: rotate(-1.5deg); }
        }

        @keyframes swayGrass {
          0%, 100% { transform: rotate(0deg); }
          33% { transform: rotate(3deg); }
          66% { transform: rotate(-2deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-6px) translateX(4px); }
          50% { transform: translateY(-3px) translateX(8px); }
          75% { transform: translateY(-8px) translateX(2px); }
        }

        @keyframes wingFlap {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.15); }
        }

        @keyframes shimmer {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .star-twinkle {
          animation: twinkle var(--dur, 3s) ease-in-out infinite;
        }

        .stem-sway {
          animation: sway 3.5s ease-in-out infinite;
        }

        .flower-group {
          animation: sway 3.5s ease-in-out infinite;
        }

        .grass-sway {
          animation: swayGrass 2.8s ease-in-out infinite;
        }

        .butterfly {
          animation: float 6s ease-in-out infinite;
        }

        .wing-left {
          animation: wingFlap 0.35s ease-in-out infinite alternate;
          transform-origin: right center;
        }

        .wing-right {
          animation: wingFlap 0.35s ease-in-out infinite alternate-reverse;
          transform-origin: left center;
        }

        .fade-up {
          animation: fadeUp 0.7s ease-out both;
        }

        .sun-shimmer {
          animation: shimmer 4s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #faf5f0 0%, #f5ede8 100%)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 16px 64px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
          {/* Eyebrow */}
          <p
            className="fade-up"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#a8929a",
              margin: "0 0 8px",
              animationDelay: "0.05s",
            }}
          >
            a garden that grows with us
          </p>

          {/* Title */}
          <h1
            className="fade-up"
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 600,
              fontSize: "clamp(32px, 8vw, 44px)",
              margin: "0 0 6px",
              color: "#3a2e35",
              letterSpacing: "-0.01em",
              animationDelay: "0.1s",
            }}
          >
            Aarna and Yuvi&apos;s Garden
          </h1>

          {/* Sub */}
          <p
            className="fade-up"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#a8929a",
              margin: "0 0 28px",
              animationDelay: "0.15s",
            }}
          >
            planted {formatDate(START_DATE)}
          </p>

          {/* Garden Scene */}
          <div
            className="fade-up"
            style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              height: 400,
              background: "linear-gradient(180deg, #2e2240 0%, #5c3d5a 30%, #a9748a 58%, #c8936a 72%, #4b5a3a 72%)",
              boxShadow: "0 24px 60px -20px rgba(58,46,53,0.4), 0 4px 16px -4px rgba(58,46,53,0.15)",
              animationDelay: "0.2s",
            }}
          >
            {/* Moon */}
            <div
              className="sun-shimmer"
              style={{
                position: "absolute",
                top: 22,
                right: 28,
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #fef3d0, #f2c97a 60%, #e0a855 100%)",
                boxShadow: "0 0 30px 12px rgba(242,201,122,0.22), 0 0 60px 24px rgba(242,201,122,0.08)",
                filter: "blur(0.3px)",
              }}
            />

            {/* Moon crescent shadow */}
            <div
              style={{
                position: "absolute",
                top: 22,
                right: 28,
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "radial-gradient(circle at 65% 38%, rgba(58,35,55,0.55) 30%, transparent 65%)",
                zIndex: 1,
              }}
            />

            {/* Stars */}
            <Stars count={28} />

            {/* Clouds (subtle) */}
            <div
              style={{
                position: "absolute",
                top: 55,
                left: "8%",
                width: 90,
                height: 28,
                borderRadius: 20,
                background: "rgba(255,255,255,0.06)",
                filter: "blur(6px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 42,
                left: "22%",
                width: 55,
                height: 18,
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                filter: "blur(4px)",
              }}
            />

            {/* Butterflies */}
            {days >= 2 && (
              <Butterfly x={18} y={38} delay={0.4} color="#f4a8b8" />
            )}
            {days >= 8 && (
              <Butterfly x={62} y={28} delay={1.8} color="#c4a8d4" />
            )}
            {days >= 18 && (
              <Butterfly x={42} y={44} delay={3.1} color="#f7c9a8" />
            )}

            {/* Ground */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "42%",
                background: "linear-gradient(180deg, #4b5a3a 0%, #3a4730 100%)",
                borderRadius: "0 0 20px 20px",
              }}
            >
              {/* Ground rim highlight */}
              <div
                style={{
                  position: "absolute",
                  top: -1,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "linear-gradient(90deg, transparent, rgba(150,190,110,0.35), rgba(120,160,80,0.4), rgba(150,190,110,0.35), transparent)",
                  filter: "blur(1px)",
                }}
              />
            </div>

            {/* Garden SVG */}
            <GardenSVG flowers={flowers} />

            {/* Scene vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 20,
                background:
                  "radial-gradient(ellipse at center, transparent 50%, rgba(20,10,25,0.25) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Stats row */}
          <div
            className="fade-up"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              margin: "20px 0 6px",
              flexWrap: "wrap",
              animationDelay: "0.3s",
            }}
          >
            {[
              { value: days, label: "days together" },
              { value: flowerCount, label: "blooms" },
              { value: Math.max(0, days+20), label: "nights I thought of you" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(196,111,136,0.18)",
                  borderRadius: 999,
                  padding: "9px 18px",
                  fontSize: 13,
                  color: "#8a7580",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <strong style={{ color: "#3a2e35", fontWeight: 600 }}>{stat.value}</strong>
                &nbsp;{stat.label}
              </div>
            ))}
          </div>

          {/* Message card */}
          <div
            className="fade-up"
            style={{
              marginTop: 28,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
              borderRadius: 20,
              padding: "32px 32px 28px",
              border: "1px solid rgba(196,111,136,0.15)",
              boxShadow: "0 8px 32px -8px rgba(196,111,136,0.12)",
              animationDelay: "0.35s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative petal watermark */}
            <svg
              style={{ position: "absolute", top: -12, right: -12, opacity: 0.07, pointerEvents: "none" }}
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
            >
              {Array.from({ length: 8 }).map((_, p) => {
                const angle = (p / 8) * Math.PI * 2;
                return (
                  <ellipse
                    key={p}
                    cx={60 + Math.cos(angle) * 28}
                    cy={60 + Math.sin(angle) * 28}
                    rx="18"
                    ry="11"
                    transform={`rotate(${(angle * 180) / Math.PI} ${60 + Math.cos(angle) * 28} ${60 + Math.sin(angle) * 28})`}
                    fill="#e98ea0"
                  />
                );
              })}
              <circle cx="60" cy="60" r="10" fill="#e98ea0" />
            </svg>

            <p
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: 14,
                color: "#a8929a",
                margin: "0 0 12px",
              }}
            >
              for Aarna,
            </p>

            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "clamp(20px, 5vw, 26px)",
                lineHeight: 1.6,
                margin: 0,
                color: "#3a2e35",
              }}
            >
              i loveee you a lott
              <br />
              <span style={{ fontSize: "0.88em", color: "#c46f88" }}>(more than you 😤)</span>
            </p>

            <div
              style={{
                marginTop: 20,
                paddingTop: 18,
                borderTop: "1px solid rgba(196,111,136,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#b8a4ae",
                  letterSpacing: "0.04em",
                }}
              >
                — growing a little more every day
              </span>
              <span style={{ fontSize: 18 }}>🌸</span>
            </div>
          </div>

          {/* Footer note */}
          <p
            className="fade-up"
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "#c4b0b8",
              letterSpacing: "0.06em",
              animationDelay: "0.4s",
            }}
          >
            a new bloom every few days ✦
          </p>
        </div>
      </div>
    </>
  );
}
