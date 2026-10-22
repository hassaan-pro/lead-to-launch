"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

// One street, drawn once, used by the hero (components/landing/HeroStreet)
// and the finale (components/story/Lights). Modelled on a real illustrated
// street: varied facades and roofs, two floors of small windows, a named
// sign over a striped awning, a lit shop window and a door. The buildings
// are authored dark in both themes: it is an evening street, and the light
// switching on is the whole point.
export const STREET_SHOPS = ["Salon", "Dental", "Cafe", "Gym", "Bakery", "Optician", "Florist", "Tailor", "Barber", "Clinic", "Tutor", "Spa"];
// Different heights so the street has a skyline.
export const STREET_HEIGHTS = [62, 80, 56, 88, 70, 60, 92, 66, 76, 58, 84, 68];

const FACADES = ["#4A322B", "#33424E", "#574434", "#3C4636", "#463A4E", "#2F4750", "#5A3A30", "#3A3F52", "#4E4234", "#31443C", "#55404E", "#42505A"];
const ROOFS = ["#2C1E19", "#1E2A33", "#38291D", "#262D22", "#2C2436", "#1E3138", "#3A241D", "#252938", "#33291E", "#1F2E28", "#382A34", "#2B363E"];
const AWNINGS = ["#B5533C", "#7A8B6F", "#C98A28", "#5B7A8C", "#A34A5E", "#6F7D5A", "#B5533C", "#5B7A8C", "#C98A28", "#7A8B6F", "#A34A5E", "#7468A8"];
const LIT_BG = "linear-gradient(180deg,#F6C968,#C98A28)";
const LIT_SHADOW = "0 0 34px 6px rgba(240,179,74,0.32)";

/**
 * One shopfront. `lit` runs 0 to 1: the shop window takes the full glow,
 * the upstairs windows and the door glass warm up more gently, and the
 * sign picks up the lamp tint. `trail` adds the finale's hover layer,
 * which lights the window early on the way in and lets it fade slowly.
 */
export function Shopfront({ i, lit, trail = false }: { i: number; lit: MotionValue<number>; trail?: boolean }) {
  const soft = useTransform(lit, [0, 1], [0, 0.5]);
  const gable = i % 3 === 1;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-t-[3px] border border-white/10" style={{ background: FACADES[i] }}>
      {/* Roof: a pitched gable on every third shop, a flat cornice on the rest. */}
      {gable ? (
        <div aria-hidden="true" className="absolute inset-x-[5%] top-0 h-[13%]" style={{ background: ROOFS[i], clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
      ) : (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[7%]" style={{ background: ROOFS[i] }} />
      )}
      {/* Upstairs windows: two floors of small panes. A couple are always
          warm (someone is home); the rest join when the shop lights. */}
      <div aria-hidden="true" className="absolute inset-x-[17%] top-[16%] grid grid-cols-2 gap-[3px]">
        {[0, 1, 2, 3].map((w) => (
          <div key={w} className="relative h-[8px] overflow-hidden rounded-[1px] border border-white/5 bg-[#12100D]/85 sm:h-[10px]">
            <div className="absolute inset-0" style={{ background: LIT_BG, opacity: (i + w) % 3 === 0 ? 0.38 : 0 }} />
            <motion.div className="absolute inset-0" style={{ background: LIT_BG, opacity: soft }} />
          </div>
        ))}
      </div>
      {/* The sign: the trade, painted over the shop, like the reference street. */}
      <div aria-hidden="true" className="absolute inset-x-[7%] top-[45%] flex h-[11%] items-center justify-center overflow-hidden rounded-[2px] bg-black/35">
        <motion.div className="absolute inset-0" style={{ background: LIT_BG, opacity: soft }} />
        <span className="relative hidden font-mono uppercase tracking-[0.14em] text-[#F1EDE4] sm:block" style={{ fontSize: "clamp(6px, 0.8vw, 10px)" }}>
          {STREET_SHOPS[i]}
        </span>
      </div>
      {/* Striped awning under the sign. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[5%] top-[57.5%] h-[4.5%]"
        style={{ background: `repeating-linear-gradient(90deg, ${AWNINGS[i]} 0 6px, rgba(0,0,0,0.28) 6px 12px)` }}
      />
      {/* The shop window: this is the light that switches on. */}
      <div aria-hidden="true" className="absolute bottom-[5%] left-[10%] top-[65%] w-[46%] rounded-[2px] border border-white/10 bg-[#0D0B09]/90">
        <motion.div className="absolute inset-0" style={{ background: LIT_BG, opacity: lit, boxShadow: LIT_SHADOW }} />
        {trail ? (
          <span className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-90 group-hover:duration-150" style={{ background: LIT_BG, boxShadow: LIT_SHADOW }} />
        ) : null}
      </div>
      {/* The door, with a glass pane that warms with the shop. */}
      <div aria-hidden="true" className="absolute bottom-0 right-[10%] top-[65%] w-[21%] rounded-t-[2px] border border-b-0 border-white/10 bg-[#0D0B09]/90">
        <div className="absolute inset-x-[18%] top-[10%] h-[38%] overflow-hidden rounded-[1px] bg-black/50">
          <motion.div className="absolute inset-0" style={{ background: LIT_BG, opacity: soft }} />
        </div>
      </div>
    </div>
  );
}

/** Two lamp posts standing in front of the facades, gently on: evening. */
export function StreetLamps() {
  return (
    <>
      {[30.5, 63.5].map((x) => (
        <div key={x} aria-hidden="true" className="pointer-events-none absolute bottom-0 z-10 hidden h-[112%] flex-col items-center sm:flex" style={{ left: `${x}%` }}>
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: "radial-gradient(circle, #FFE9B0 0%, #F0B34A 48%, rgba(240,179,74,0) 74%)", boxShadow: "0 0 18px 7px rgba(240,179,74,0.35)" }}
          />
          <div className="w-[2px] flex-1 bg-[#14181D]" />
        </div>
      ))}
    </>
  );
}
