/**
 * Convex is wired up only when the deployment URL is present. Until then
 * the app runs exactly as before and the saved-leads UI explains the setup
 * instead of crashing.
 */
export function isConvexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}
