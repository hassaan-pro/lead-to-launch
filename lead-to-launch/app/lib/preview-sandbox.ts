// Sandbox tokens for the generated site preview iframe in SiteStudio.
// This is the M3 fix from the Oct 26 security audit.
//
// Kept:
// - allow-scripts: generated pages need inline script for motion and
//   signature devices, and the iframe has no allow-same-origin, so a
//   script runs with an opaque origin and cannot touch this app's
//   cookies, storage, or Convex session.
// - allow-popups: booking links need to open a new tab. Without this,
//   clicking a WhatsApp or booking link in the preview does nothing.
//
// Removed:
// - allow-popups-to-escape-sandbox: a popup opened from the preview
//   used to leave the sandbox entirely, gaining full privileges. Now
//   any popup stays sandboxed, so it cannot gain privileges, touch the
//   main app, or silently redirect it. Booking links still open, they
//   just open as sandboxed popups.
// Never added, on purpose:
// - allow-same-origin, allow-forms, allow-top-navigation: the preview
//   must not submit forms, navigate the main app, or share its origin.
export const PREVIEW_SANDBOX = "allow-scripts allow-popups";
