import { useEffect, useRef, useState } from "react";

const START_DATE = new Date(2026, 5, 14);
const GARDEN_SONG_URL = "https://svctkowusswvfjhnftgd.supabase.co/storage/v1/object/public/Aarna-garden/98%20Ek%20Ajnabee%20Haseena%20Se%20-%20PagalNew.mp3";
const NOTES_SONG_URL = "https://svctkowusswvfjhnftgd.supabase.co/storage/v1/object/public/Aarna-garden/Bryan%20Adams%20-%20Heaven.mp3"; 

const FEATURES = {
  birthdayMode: "auto" as "auto" | "on" | "off",
};

function isBirthdayWindow(): boolean {
  const now = new Date();
  const start = new Date(2026, 9, 4, 0, 0, 0);  // midnight, Oct 4 2026
  const end = new Date(2026, 9, 5, 0, 0, 0);    // midnight, Oct 5 2026 (i.e. all day Oct 4)
  return now >= start && now < end;
}

function isBirthdayModeActive(): boolean {
  if (FEATURES.birthdayMode === "on") return true;
  if (FEATURES.birthdayMode === "off") return false;
  return isBirthdayWindow();
}

const NOTES_DATA = [
  {
    id: 1,
    date: "2026-07-03",
    occasion: "aise hi ❤️",
    title: "The most lovable person ever",
    content: "Aarna you are worthy of all the love on the planet and more, I wish I can do justice to your beautiful soul....I love you sooooo much"
  },
  {
    id: 2,
    date: "2026-07-04",
    occasion: "Celebrating your existence",
    title: "A gifting day",
    content: "Even though my earlier expression of gratitude was met with a shut up call, I am really really thankful not just for ther gift but for you excietment about things...my opposite in just the right way, I love you so much Aarna"
  },
 
];

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

interface GardenPhoto {
  src: string;
  caption: string;
}

function prettifyName(filename: string): string {
  const base = filename.split("/").pop() ?? filename;
  const withoutExt = base.replace(/\.[^/.]+$/, "");
  return withoutExt.replace(/[-_]+/g, " ").trim();
}

// @ts-ignore
const mediaModules = import.meta.glob("../assets/photos/*.{jpg,jpeg,png,webp,gif,mp4,mov,webm}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const LOCAL_MEDIA = Object.entries(mediaModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => {
    return { 
      src, 
      caption: prettifyName(path) 
    };
  });

const PHOTOS: GardenPhoto[] = [
  // 🍿 PASTE YOUR SUPABASE/S3 LINKS HERE!
  {
    src: "https://svctkowusswvfjhnftgd.supabase.co/storage/v1/object/public/Aarna-garden/Ambala.webm",
    caption: "Ambala"
  },
  {
    src: "https://svctkowusswvfjhnftgd.supabase.co/storage/v1/object/public/Aarna-garden/first-event%20copy.webm",
    caption: "First event together"
  },
   {
    src: "https://svctkowusswvfjhnftgd.supabase.co/storage/v1/object/public/Aarna-garden/sun%20wasnt%20the%20only%20thing%20kissed.webm",
    caption: "Sun wasn't the only thing kissed"
  },
  {
    src: "https://svctkowusswvfjhnftgd.supabase.co/storage/v1/object/public/Aarna-garden/WhatsApp%20Image%202026-07-02%20at%2014.47.48.jpeg",
    caption: "Trademark pose"
  },
  { src: "https://svctkowusswvfjhnftgd.supabase.co/storage/v1/object/public/Aarna-garden/WhatsApp%20Video%202026-07-02%20at%2015.12.39.mp4",
     caption: "Cactus Garden" 
    },

  ...LOCAL_MEDIA
];
function EmptyGalleryHint() {
  return (
    <div style={{ color: "#a8929a", fontStyle: "italic", fontSize: 13, padding: "20px 0" }}>
      Add some photos or videos to src/assets/photos/ to start making your memories bloom!
    </div>
  );
}

function PhotoCard({ photo, rotate }: { photo: GardenPhoto; rotate: number }) {
  const isVideo = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(photo.src);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 8,
        paddingBottom: 28,
        boxShadow: "0 10px 24px -10 rgba(58,46,53,0.22)",
        transform: `rotate(${rotate}deg)`,
        transition: "transform 0.25s ease",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          background: "#f0ede9",
        }}
      >
        {isVideo ? (
          <video
            src={photo.src}
            muted
            autoPlay
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `center / cover no-repeat url(${photo.src})`,
            }}
          />
        )}
      </div>
      <p
        style={{
          position: "absolute",
          bottom: 6,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: 12,
          color: "#a8929a",
          margin: 0,
        }}
      >
        {photo.caption}
      </p>
    </div>
  );
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

      <ellipse cx="280" cy="238" rx="290" ry="18" fill="url(#groundSheen)" />

      {grassBlades.slice(0, 20).map((b, i) => (
        <g key={`bg-grass-${i}`}>
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

      {flowers.map((f, idx) => {
        const baseY = 236;
        const topY = baseY - f.height;
        const ctrlX = f.x + f.sway;
        const [petalColor, centerColor] = BLOOM_COLORS[f.colorIdx % BLOOM_COLORS.length];
        const tipX = f.x + f.sway * 0.45;

        return (
          <g key={idx} className="flower-group" style={{ animationDelay: `${f.animDelay}s` }}>
            <path
              d={`M ${f.x} ${baseY} Q ${ctrlX} ${baseY - f.height * 0.55} ${tipX} ${topY}`}
              stroke="#5d7a4a"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              style={{ transformOrigin: `${f.x}px ${baseY}px`, animationDelay: `${f.animDelay}s` }}
              className="stem-sway"
            />

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

function BirthdayOverlay() {
  const balloons = Array.from({ length: 16 }, (_, i) => ({
    left: seededRand(i * 19) * 96 + 2,
    delay: seededRand(i * 31) * 6,
    duration: 7 + seededRand(i * 41) * 4,
    scale: 0.8 + seededRand(i * 53) * 0.6,
    color: ["#f4a8b8", "#f7c9a8", "#c4a8d4", "#b8d4a8", "#f6e2b8", "#f0b3c4"][i % 6],
  }));

  const confetti = Array.from({ length: 40 }, (_, i) => ({
    left: seededRand(i * 61) * 100,
    delay: seededRand(i * 71) * 5,
    duration: 4 + seededRand(i * 83) * 3,
    size: 5 + seededRand(i * 91) * 5,
    color: ["#f4a8b8", "#f7c9a8", "#c4a8d4", "#b8d4a8", "#f6e2b8", "#e98ea0", "#d4b8e0"][i % 7],
    shape: i % 3,
  }));

  const streamerColors = ["#f4a8b8", "#f7c9a8", "#c4a8d4", "#b8d4a8", "#f6e2b8", "#e98ea0"];

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998, overflow: "hidden" }}>
      {/* Streamers hanging from the top corners */}
      {[8, 22, 78, 92].map((left, i) => (
        <svg
          key={`streamer-${i}`}
          width="4"
          height="220"
          viewBox="0 0 4 220"
          style={{ position: "absolute", top: 0, left: `${left}%`, opacity: 0.8 }}
          className="streamer-sway"
        >
          <path
            d="M2 0 Q -8 40 2 80 Q 12 120 2 160 Q -6 190 2 220"
            stroke={streamerColors[i % streamerColors.length]}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ))}

      {/* Bunting / flag banner across the very top */}
      <svg
        width="100%"
        height="60"
        viewBox="0 0 560 60"
        preserveAspectRatio="none"
        style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
      >
        <path d="M0 6 Q 280 40 560 6" stroke="#c46f88" strokeWidth="2" fill="none" opacity="0.5" />
        {Array.from({ length: 13 }).map((_, i) => {
          const t = i / 12;
          const x = t * 560;
          const y = 6 + Math.sin(t * Math.PI) * 34;
          return (
            <path
              key={i}
              d={`M ${x} ${y} L ${x - 11} ${y + 22} L ${x + 11} ${y + 22} Z`}
              fill={streamerColors[i % streamerColors.length]}
              opacity="0.9"
            />
          );
        })}
      </svg>

      {/* Falling confetti */}
      {confetti.map((c, i) => (
        <div
          key={`confetti-${i}`}
          className="confetti-fall"
          style={{
            position: "absolute",
            left: `${c.left}%`,
            top: "-20px",
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: c.shape === 0 ? "50%" : c.shape === 1 ? "2px" : "0",
            transform: c.shape === 2 ? "rotate(45deg)" : "none",
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Rising balloons */}
      {balloons.map((b, i) => (
        <div
          key={`balloon-${i}`}
          className="balloon-float"
          style={{
            position: "absolute",
            left: `${b.left}%`,
            bottom: "-140px",
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            transform: `scale(${b.scale})`,
          }}
        >
          <svg width="36" height="50" viewBox="0 0 36 50" fill="none">
            <ellipse cx="18" cy="18" rx="16" ry="18" fill={b.color} opacity="0.9" />
            <ellipse cx="13" cy="12" rx="4" ry="5" fill="rgba(255,255,255,0.4)" />
            <path d="M18 36 L15 40 L21 40 Z" fill={b.color} opacity="0.9" />
            <line x1="18" y1="40" x2="18" y2="50" stroke="#a8929a" strokeWidth="1" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function BirthdayBanner() {
  return (
    <div
      className="fade-up birthday-banner-pulse"
      style={{
        position: "relative",
        display: "block",
        background: "linear-gradient(135deg, #f4a8b8 0%, #f7c9a8 35%, #c4a8d4 70%, #f0b3c4 100%)",
        borderRadius: 24,
        padding: "26px 24px",
        margin: "0 0 28px",
        boxShadow: "0 16px 40px -12px rgba(196,111,136,0.45)",
        border: "1px solid rgba(255,255,255,0.4)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ fontSize: 40, marginBottom: 6, letterSpacing: 4 }}>🎉🎂🎈</div>
      <h2
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 700,
          fontSize: "clamp(24px, 6vw, 34px)",
          color: "#fff",
          margin: "0 0 6px",
          textShadow: "0 2px 12px rgba(58,46,53,0.25)",
        }}
      >
        Happy Birthday Aarna!❤️❤️❤️
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "rgba(255,255,255,0.95)",
          margin: 0,
          textShadow: "0 1px 8px rgba(58,46,53,0.2)",
        }}
      >
        the whole garden is celebrating you today ✨
      </p>
    </div>
  );
}

export default function App() {
  const days = daysSince(START_DATE);
  const flowers = buildFlowers(days);
  const flowerCount = flowers.filter((f) => f.hasBoom).length;
  const birthdayActive = isBirthdayModeActive();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // ⚡ Hash routing state to handle hidden notes page toggle seamlessly
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // 🎵 Two separate tracks — one for the garden, one for the notes page
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notesAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(GARDEN_SONG_URL);
    audio.loop = true;
    audioRef.current = audio;

    const notesAudio = new Audio(NOTES_SONG_URL);
    notesAudio.loop = true;
    notesAudioRef.current = notesAudio;

    // Listen for hash variations back and forth
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      audio.pause();
      notesAudio.pause();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Helper: whichever track matches the page we're currently on
  const getActiveAudio = () => (currentHash === "#notes" ? notesAudioRef.current : audioRef.current);

  // When the page (hash) changes, pause the track that's no longer relevant
  // and, if music is on, start playing the one for the new page.
  useEffect(() => {
    if (!isUnlocked) return;

    const active = currentHash === "#notes" ? notesAudioRef.current : audioRef.current;
    const inactive = currentHash === "#notes" ? audioRef.current : notesAudioRef.current;

    inactive?.pause();

    if (isPlaying && active) {
      active.play().catch((err) => console.error("Track switch error:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHash, isUnlocked]);

  const handleEnterGarden = () => {
    const active = getActiveAudio();
    if (active) {
      active.play()
        .then(() => {
          setIsPlaying(true);
          setIsUnlocked(true);
        })
        .catch((err) => {
          console.error("Audio block or missing file error details:", err);
          setIsUnlocked(true); 
        });
    } else {
      setIsUnlocked(true);
    }
  };

  const toggleMusic = () => {
    const active = getActiveAudio();
    if (!active) return;
    if (isPlaying) {
      active.pause();
      setIsPlaying(false);
    } else {
      active.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Toggle block error:", err));
    }
  };

  // Sort notes so latest entries appear on top
  const sortedNotes = [...NOTES_DATA].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        /* 🎨 FIGMA DESIGN TOKENS FOR THE PRIVATE NOTES PAGE */
        /* You can map out changes from Figma straight into these tokens! */
        :root {
          --notes-page-bg: #faf5f0;           /* Background of the note view canvas */
          --note-card-bg: #ffffff;            /* Background color of individual cards */
          --note-card-radius: 20px;           /* Rounded corner styling from Figma */
          --note-card-padding: 24px;          /* Auto Layout inner spacing padding */
          --note-card-border: 1px solid rgba(196, 111, 136, 0.15);
          --note-card-shadow: 0 10px 25px -10px rgba(58,46,53,0.08);

          /* Typography Tokens */
          --note-title-color: #3a2e35;
          --note-accent-rgb: 196, 111, 136;   /* Theme highlight accent color (#c46f88) */
          --note-body-color: #615058;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #faf5f0;
          margin: 0;
          min-height: 100vh;
          overflow-x: hidden;
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

        @keyframes pulseMusic {
          0% { transform: scale(1); box-shadow: 0 8px 24px rgba(196,111,136,0.15); }
          50% { transform: scale(1.04); box-shadow: 0 8px 32px rgba(196,111,136,0.3); }
          100% { transform: scale(1); box-shadow: 0 8px 24px rgba(196,111,136,0.15); }
        }

        .star-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .stem-sway { animation: sway 3.5s ease-in-out infinite; }
        .flower-group { animation: sway 3.5s ease-in-out infinite; }
        .grass-sway { animation: swayGrass 2.8s ease-in-out infinite; }
        .butterfly { animation: float 6s ease-in-out infinite; }
        
        .wing-left {
          animation: wingFlap 0.35s ease-in-out infinite alternate;
          transform-origin: right center;
        }

        .wing-right {
          animation: wingFlap 0.35s ease-in-out infinite alternate-reverse;
          transform-origin: left center;
        }

        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .sun-shimmer { animation: shimmer 4s ease-in-out infinite; }
        .music-playing { animation: pulseMusic 2s infinite ease-in-out; }

        @keyframes balloonFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          8% { opacity: 0.9; }
          50% { transform: translateY(-60vh) translateX(12px); }
          100% { transform: translateY(-130vh) translateX(-10px); opacity: 0.8; }
        }
        .balloon-float { animation: balloonFloat linear infinite; }

        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.9; }
        }
        .confetti-fall { animation: confettiFall linear infinite; }

        @keyframes streamerSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }
        .streamer-sway { animation: streamerSway 3s ease-in-out infinite; transform-origin: top center; }

        @keyframes bannerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        .birthday-banner-pulse { animation: bannerPulse 3s ease-in-out infinite; }

        /* Notes Section Specific Component Layout Styles */
        .notes-view-container {
          max-width: 560px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 16px 64px;
        }
        .note-card-item {
          background-color: var(--note-card-bg);
          border-radius: var(--note-card-radius);
          padding: var(--note-card-padding);
          border: var(--note-card-border);
          box-shadow: var(--note-card-shadow);
          text-align: left;
          margin-bottom: 24px;
        }
        .note-card-item:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
        .note-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .note-badge-occasion {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgb(var(--note-accent-rgb));
          background: rgba(var(--note-accent-rgb), 0.08);
          padding: 4px 10px;
          borderRadius: 99px;
        }
        .note-timestamp {
          font-size: 12px;
          color: #a8929a;
        }
        .note-card-headline {
          font-family: 'Lora', serif;
          font-weight: 600;
          font-size: 20px;
          color: var(--note-title-color);
          margin: 0 0 10px 0;
        }
        .note-card-body-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--note-body-color);
          margin: 0;
          white-space: pre-line;
        }
      `}</style>

      {/* Entry Gate Overlay */}
      {!isUnlocked && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "linear-gradient(160deg, #faf5f0 0%, #edf0f5 100%)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "40px 32px",
              borderRadius: 24,
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 50px -15px rgba(58,46,53,0.15)",
              border: "1px solid rgba(196,111,136,0.12)",
            }}
          >
            <span style={{ fontSize: 42, display: "block", marginBottom: 16 }}>🌸</span>
            <h2
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 24,
                color: "#3a2e35",
                margin: "0 0 10px",
                fontWeight: 600,
              }}
            >
              Yuvi & Aarna&apos;s Garden
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#a8929a",
                lineHeight: 1.5,
                margin: "0 0 28px",
              }}
            >
              Welcome to our little world. Turn your sound up to listen to the garden sing!
            </p>
            <button
              onClick={handleEnterGarden}
              style={{
                background: "linear-gradient(135deg, #e98ea0 0%, #c46f88 100%)",
                border: "none",
                borderRadius: 99,
                padding: "14px 36px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 8px 24px -6px rgba(233,142,160,0.5)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Enter Garden ✦
            </button>
          </div>
        </div>
      )}
      {birthdayActive && <BirthdayOverlay />}
      {currentHash === "#notes" ? (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--notes-page-bg)", display: "flex", justifyContent: "center" }}>
          <div className="notes-view-container fade-up">
            <div style={{ textAlign: "left", marginBottom: 32 }}>
              <a 
                href="#" 
                style={{ 
                  textDecoration: "none", 
                  color: "#a8929a", 
                  fontSize: 13, 
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                ← Back to Garden
              </a>
            </div>

            <header style={{ textAlign: "center", marginBottom: 44 }}>
              <span style={{ fontSize: 32 }}>✍️</span>
              <h1 style={{ fontFamily: "'Lora', serif", color: "var(--note-title-color)", margin: "8px 0 4px", fontWeight: 600, fontSize: 32 }}>
                Notes for Aarna
              </h1>
              <p style={{ color: "#a8929a", fontSize: 13, margin: 0 }}>Little messages saved for special moments.</p>
            </header>

            <div>
              {sortedNotes.map((note) => (
                <article key={note.id} className="note-card-item">
                  <div className="note-meta-row">
                    <span className="note-badge-occasion">{note.occasion}</span>
                    <time className="note-timestamp">
                      {new Date(note.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </time>
                  </div>
                  <h2 className="note-card-headline">{note.title}</h2>
                  <p className="note-card-body-text">{note.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 🏡 PRIMARY ROUTE: MAIN SITE GARDEN VIEW */
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
            {birthdayActive && <BirthdayBanner />}

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

              <Stars count={28} />

              <div style={{ position: "absolute", top: 55, left: "8%", width: 90, height: 28, borderRadius: 20, background: "rgba(255,255,255,0.06)", filter: "blur(6px)" }} />
              <div style={{ position: "absolute", top: 42, left: "22%", width: 55, height: 18, borderRadius: 20, background: "rgba(255,255,255,0.04)", filter: "blur(4px)" }} />

              {days >= 2 && <Butterfly x={18} y={38} delay={0.4} color="#f4a8b8" />}
              {days >= 8 && <Butterfly x={62} y={28} delay={1.8} color="#c4a8d4" />}
              {days >= 18 && <Butterfly x={42} y={44} delay={3.1} color="#f7c9a8" />}

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
                <div style={{ position: "absolute", top: -1, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, rgba(150,190,110,0.35), rgba(120,160,80,0.4), rgba(150,190,110,0.35), transparent)", filter: "blur(1px)" }} />
              </div>

              <GardenSVG flowers={flowers} />

              <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "radial-gradient(ellipse at center, transparent 50%, rgba(20,10,25,0.25) 100%)", pointerEvents: "none" }} />
            </div>

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
                { value: Math.max(0, days + 20), label: "nights I thought of you" },
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
              <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 14, color: "#a8929a", margin: "0 0 12px" }}>
                for Aarna,
              </p>

              <p style={{ fontFamily: "'Lora', serif", fontSize: "clamp(20px, 5vw, 26px)", lineHeight: 1.6, margin: 0, color: "#3a2e35" }}>
                I loveee you a lott
                <br />
                <span style={{ fontSize: "0.88em", color: "#c46f88" }}>(more than you 😤)</span>
              </p>

              {/* 🚪 HERE IS THE NEW HANDY LINK TO ENTER THE NOTES VIEW */}
              <div style={{ marginTop: 18 }}>
                <a 
                  href="#notes" 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(196, 111, 136, 0.08)",
                    border: "1px solid rgba(196, 111, 136, 0.2)",
                    padding: "8px 18px",
                    borderRadius: 99,
                    fontSize: 12,
                    color: "#c46f88",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "all 0.2s ease-in-out"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(196, 111, 136, 0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(196, 111, 136, 0.08)"}
                >
                  Read special notes for you 📝✨
                </a>
              </div>

              <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(196,111,136,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#b8a4ae", letterSpacing: "0.04em" }}>
                  — growing like our love for each other
                </span>
                <span style={{ fontSize: 18 }}>🌸</span>
              </div>
            </div>

            <div className="fade-up" style={{ marginTop: 28, animationDelay: "0.38s" }}>
              <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 13, color: "#a8929a", margin: "0 0 14px" }}>
                little moments
              </p>
              {PHOTOS.length === 0 ? (
                <EmptyGalleryHint />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 16 }}>
                  {PHOTOS.map((photo, i) => (
                    <PhotoCard key={photo.src} photo={photo} rotate={i % 2 === 0 ? -2.5 : 2.5} />
                  ))}
                </div>
              )}
            </div>

            <p className="fade-up" style={{ marginTop: 24, fontSize: 11, color: "#c4b0b8", letterSpacing: "0.06em", animationDelay: "0.4s" }}>
              a new bloom every few days ✦
          </p>
          </div>
        </div>
      )}

      {/* Floating Music Toggle Button */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={toggleMusic}
          className={isPlaying ? "music-playing" : ""}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(196, 111, 136, 0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            outline: "none",
          }}
          title={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? "🎵" : "🔇"}
        </button>
      </div>
    </>
  );
}