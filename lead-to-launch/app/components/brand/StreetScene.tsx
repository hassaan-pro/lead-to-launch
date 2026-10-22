"use client";

import { motion, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

// The street as one drawn scene: an SVG generated shop by shop, so it has
// the depth of an illustration (varied facades, gables and mansards,
// arched windows, balconies, scalloped awnings, named signs, lamp posts,
// a night sky) while every shop still lights on its own. Two compositions
// share the drawing: `tall` for the hero panel, the default wide band for
// the finale. Brand register throughout: ink sky, bone lettering, lamp
// amber light, the mono face for the painted signs.
export const STREET_SHOPS = ["Salon", "Dental", "Cafe", "Gym", "Bakery", "Optician", "Florist", "Tailor", "Barber", "Clinic", "Tutor", "Spa"];

const WIDTHS = [92, 104, 88, 110, 96, 90, 112, 94, 102, 88, 106, 96];
const HEIGHTS_TALL = [250, 300, 230, 330, 270, 240, 350, 260, 290, 235, 320, 265];
const HEIGHTS_BAND = HEIGHTS_TALL.map((h) => Math.round(h * 0.58));
const FACADES = ["#4A322B", "#33424E", "#574434", "#3C4636", "#463A4E", "#2F4750", "#5A3A30", "#3A3F52", "#4E4234", "#31443C", "#55404E", "#42505A"];
const ROOFS = ["#241A15", "#1B252D", "#2F2115", "#20261D", "#261E30", "#1A2A30", "#2F1D16", "#20242F", "#2A2115", "#1B2822", "#2F222C", "#242E36"];
const AWNINGS = ["#B5533C", "#7A8B6F", "#C98A28", "#5B7A8C", "#A34A5E", "#6F7D5A", "#B5533C", "#5B7A8C", "#C98A28", "#7A8B6F", "#A34A5E", "#7468A8"];

const MONO = "JetBrains Mono, ui-monospace, monospace";

function layout(totalWidth: number) {
  const scale = totalWidth / 1200;
  const xs: number[] = [];
  let x = 6 * scale;
  for (let i = 0; i < WIDTHS.length; i++) {
    xs.push(x);
    x += (WIDTHS[i] + 1.45) * scale;
  }
  return { xs, ws: WIDTHS.map((w) => w * scale) };
}

// Deterministic star field for the tall composition.
const STARS = Array.from({ length: 42 }, (_, k) => {
  const a = (k * 137.5) % 1200;
  const b = (k * 89.3) % 150;
  return { x: a, y: 12 + b, r: k % 5 === 0 ? 1.7 : 1, o: 0.25 + ((k * 7) % 10) / 18 };
});

function archPath(x: number, y: number, w: number, h: number) {
  return `M ${x} ${y + h} L ${x} ${y + 6} Q ${x} ${y} ${x + w / 2} ${y} Q ${x + w} ${y} ${x + w} ${y + 6} L ${x + w} ${y + h} Z`;
}

/**
 * One shop in the scene. Static layer first (the building as it stands in
 * the evening), then the lit layer on a motion group: window glow, sign
 * lit amber with dark letters, upstairs windows and the door pane warm.
 * `trail` adds the finale's hover layer over the shop window.
 */
export function ShopGroup({
  i,
  lit,
  tall = false,
  trail = false,
}: {
  i: number;
  lit: MotionValue<number> | number;
  tall?: boolean;
  trail?: boolean;
}) {
  const W = tall ? 1200 : 1440;
  const groundY = tall ? 428 : 262;
  const { xs, ws } = layout(W);
  const w = ws[i];
  const h = (tall ? HEIGHTS_TALL : HEIGHTS_BAND)[i];
  const x = xs[i];
  const roof = i % 3; // 0 flat + chimney, 1 gable, 2 mansard
  const cols = w >= 100 * (W / 1200) ? 3 : 2;
  const rows = h >= (tall ? 295 : 170) ? 3 : 2;
  const winW = 12 * (W / 1200);
  const winH = tall ? 19 : 13;
  const signY = h * 0.545;
  const shopY = h * 0.665;
  const shopW = w * 0.54;
  const shopH = h * 0.255;
  const doorX = w * 0.7;
  const doorW = w * 0.21;

  const windows: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = 12 + c * ((w - 24 - winW) / Math.max(1, cols - 1));
      const wy = h * (0.13 + r * 0.155);
      const warm = (i * 2 + r * 3 + c) % 4 === 0;
      windows.push(
        <g key={`${r}-${c}`}>
          <path d={archPath(wx, wy, winW, winH)} fill="#0E1116" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
          {warm ? <path d={archPath(wx, wy, winW, winH)} fill="url(#ss-warm)" opacity="0.5" /> : null}
        </g>,
      );
    }
  }
  // Half the upstairs windows join the lit layer, re-rendered there with
  // the same coordinates.
  const litWindows: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((i + r + c) % 2 !== 0) continue;
      const wx = 12 + c * ((w - 24 - winW) / Math.max(1, cols - 1));
      const wy = h * (0.13 + r * 0.155);
      litWindows.push(<path key={`${r}-${c}`} d={archPath(wx, wy, winW, winH)} fill="url(#ss-warm)" opacity="0.85" />);
    }
  }
  const scallops = (() => {
    const seg = 11 * (W / 1200);
    const n = Math.max(3, Math.floor((w - 6) / seg));
    let d = `M 3 ${signY + 24}`;
    for (let k = 0; k < n; k++) d += ` a ${seg / 2} ${seg / 2} 0 0 0 ${seg} 0`;
    return d;
  })();

  return (
    <g className="group" transform={`translate(${x} ${groundY - h})`}>
      {/* Depth: a shaded side face so the row reads as buildings, not cards. */}
      {i < STREET_SHOPS.length - 1 ? <polygon points={`${w},8 ${w + 7},0 ${w + 7},${h - 5} ${w},${h}`} fill="#000" opacity="0.22" /> : null}
      <rect x="0" y="0" width={w} height={h} fill={FACADES[i]} />
      <rect x="0" y="0" width={w} height={h} fill="url(#ss-shade)" />
      <rect x={w - 8} y="0" width="8" height={h} fill="#000" opacity="0.14" />
      {/* Roofs */}
      {roof === 0 ? (
        <>
          <rect x="-3" y="-7" width={w + 6} height="9" fill={ROOFS[i]} />
          <rect x={w * 0.64} y="-17" width="11" height="11" fill={ROOFS[i]} />
          <rect x={w * 0.64 - 1.5} y="-19" width="14" height="3.5" fill={ROOFS[i]} />
        </>
      ) : roof === 1 ? (
        <polygon points={`${w / 2},${-h * 0.15} ${w + 3},0 -3,0`} fill={ROOFS[i]} />
      ) : (
        <polygon points={`9,${-h * 0.085} ${w - 9},${-h * 0.085} ${w},0 0,0`} fill={ROOFS[i]} />
      )}
      {windows}
      {i % 5 === 2 ? (
        <g stroke="rgba(0,0,0,0.4)" strokeWidth="1.4">
          <line x1="6" y1={h * 0.13 + winH + 5} x2={w - 6} y2={h * 0.13 + winH + 5} />
          <line x1="6" y1={h * 0.13 + winH + 10} x2={w - 6} y2={h * 0.13 + winH + 10} />
        </g>
      ) : null}
      {/* Sign, awning, shop window, door */}
      <rect x="5" y={signY} width={w - 10} height="19" rx="2" fill="#100D0B" opacity="0.88" stroke="rgba(255,255,255,0.07)" />
      <text x={w / 2} y={signY + 13.5} textAnchor="middle" fontFamily={MONO} fontSize={tall ? 10.5 : 12.5} letterSpacing="1.6" fill="#EDE6D6">
        {STREET_SHOPS[i].toUpperCase()}
      </text>
      <rect x="3" y={signY + 19} width={w - 6} height="5" fill={AWNINGS[i]} />
      <path d={scallops} fill={AWNINGS[i]} />
      <rect x="7" y={shopY} width={shopW} height={shopH} fill="#0B0D10" stroke="rgba(255,255,255,0.09)" />
      <line x1={7 + shopW / 2} y1={shopY} x2={7 + shopW / 2} y2={shopY + shopH} stroke="rgba(255,255,255,0.08)" />
      <line x1="7" y1={shopY + shopH / 2} x2={7 + shopW} y2={shopY + shopH / 2} stroke="rgba(255,255,255,0.08)" />
      <rect x={doorX} y={shopY} width={doorW} height={h - shopY} fill="#0A0C0F" stroke="rgba(255,255,255,0.08)" />
      <rect x={doorX + 3} y={shopY + 5} width={doorW - 6} height={(h - shopY) * 0.36} fill="#12161C" />
      <rect x={doorX - 2} y={h - 3} width={doorW + 4} height="3" fill="#000" opacity="0.35" />
      {/* The lit layer */}
      <motion.g style={{ opacity: lit }}>
        <ellipse cx={7 + shopW / 2} cy={shopY + shopH / 2} rx={shopW * 0.98} ry={shopH * 1.2} fill="url(#ss-glow)" />
        <rect x="7" y={shopY} width={shopW} height={shopH} fill="url(#ss-warm)" />
        <rect x="5" y={signY} width={w - 10} height="19" rx="2" fill="url(#ss-warm)" />
        <text x={w / 2} y={signY + 13.5} textAnchor="middle" fontFamily={MONO} fontSize={tall ? 10.5 : 12.5} letterSpacing="1.6" fill="#241703">
          {STREET_SHOPS[i].toUpperCase()}
        </text>
        {litWindows}
        <rect x={doorX + 3} y={shopY + 5} width={doorW - 6} height={(h - shopY) * 0.36} fill="url(#ss-warm)" opacity="0.8" />
      </motion.g>
      {trail ? (
        <g className="opacity-0 transition-opacity duration-700 group-hover:opacity-90 group-hover:duration-150">
          <ellipse cx={7 + shopW / 2} cy={shopY + shopH / 2} rx={shopW * 0.98} ry={shopH * 1.2} fill="url(#ss-glow)" />
          <rect x="7" y={shopY} width={shopW} height={shopH} fill="url(#ss-warm)" />
        </g>
      ) : null}
    </g>
  );
}

/**
 * The scene frame: sky, stars and moon for the tall composition, three
 * lamp posts, the pavement, then the shops (children). One set of defs
 * serves both variants; ids are prefixed ss- and the scene renders once
 * per page view in each variant, hero first.
 */
export function StreetScene({
  tall = false,
  className,
  children,
}: {
  tall?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const W = tall ? 1200 : 1440;
  const H = tall ? 470 : 300;
  const groundY = tall ? 428 : 262;
  const lampXs = [0.27, 0.52, 0.78].map((f) => f * W);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio={tall ? "xMidYMid meet" : "xMidYMax slice"}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C0F14" />
          <stop offset="0.68" stopColor="#171C26" />
          <stop offset="1" stopColor="#1D232F" />
        </linearGradient>
        <linearGradient id="ss-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="ss-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3A6" />
          <stop offset="0.55" stopColor="#F0B34A" />
          <stop offset="1" stopColor="#C9822A" />
        </linearGradient>
        <radialGradient id="ss-glow">
          <stop offset="0" stopColor="#F6C968" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F6C968" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ss-pave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#191D24" />
          <stop offset="1" stopColor="#0E1116" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#ss-sky)" />
      {tall
        ? STARS.map((s, k) => <circle key={k} cx={s.x} cy={s.y} r={s.r} fill="#F1EDE4" opacity={s.o} />)
        : null}
      {tall ? (
        <g>
          <circle cx={W * 0.865} cy="52" r="30" fill="url(#ss-glow)" opacity="0.55" />
          <circle cx={W * 0.865} cy="52" r="17" fill="#F5EFE0" opacity="0.92" />
          <circle cx={W * 0.865 + 7} cy="46" r="14.5" fill="#0E1219" />
        </g>
      ) : null}
      {children}
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#ss-pave)" />
      <rect x="0" y={groundY} width={W} height="2" fill="#fff" opacity="0.05" />
      {lampXs.map((lx) => (
        <g key={lx}>
          <ellipse cx={lx} cy={groundY + 15} rx="86" ry="9" fill="url(#ss-glow)" opacity="0.32" />
          <rect x={lx - 1.2} y={groundY - 118} width="2.4" height="118" fill="#0B0E12" />
          <circle cx={lx} cy={groundY - 124} r="15" fill="url(#ss-glow)" opacity="0.85" />
          <circle cx={lx} cy={groundY - 124} r="4.6" fill="#FFE9B0" />
        </g>
      ))}
    </svg>
  );
}
