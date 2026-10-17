import { useTransform, type MotionValue } from "framer-motion";

export type P = MotionValue<number>;
export const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Piecewise-linear interpolation, clamped at both ends.
 *
 * We deliberately avoid useTransform(value, input, output) for scroll values: Framer Motion hands those to the
 * browser's native scroll timeline, and for our ranges it pads the keyframes wrongly, so a value that should
 * stay at 0 climbs back to 1 by the end of the section. A function transform is computed in JS and always right.
 */
export function interp(v: number, xs: number[], ys: number[], ease?: (t: number) => number): number {
  if (v <= xs[0]) return ys[0];
  const last = xs.length - 1;
  if (v >= xs[last]) return ys[last];
  let i = 0;
  while (i < last && v > xs[i + 1]) i++;
  const t = (v - xs[i]) / (xs[i + 1] - xs[i]);
  const e = ease ? ease(t) : t;
  return ys[i] + (ys[i + 1] - ys[i]) * e;
}

export function useRange(value: MotionValue<number>, xs: number[], ys: number[], ease?: (t: number) => number) {
  return useTransform(value, (v) => interp(v, xs, ys, ease));
}

/** Same, but formats the result as a percentage string for left, top, width, height, x and y. */
export function usePct(value: MotionValue<number>, xs: number[], ys: number[]) {
  return useTransform(value, (v) => `${interp(v, xs, ys)}%`);
}

/** 0 to 1 across the scroll range [a, b], clamped. */
export function useSeg(p: P, a: number, b: number) {
  return useRange(p, [a, b], [0, 1]);
}

/** Fades in across [a, b], holds, fades out across [c, d]. */
export function useWindow(p: P, a: number, b: number, c: number, d: number) {
  return useRange(p, [a, b, c, d], [0, 1, 1, 0]);
}
