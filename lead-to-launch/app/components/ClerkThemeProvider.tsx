"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

// Clerk, dressed as Outrive in both themes. The old setup hardcoded one
// dark palette in the root layout, so in light mode the sign-in card
// stayed dark with near-invisible text. This provider watches the theme
// class on <html> (the same mechanism as the street scene and the
// ThemeToggle) and hands Clerk the matching appearance: charcoal card,
// bone text and the bone pill button in the dark; warm white card, ink
// text and the ink pill button in the light, mirroring the site's own
// Start free button in each theme.
const FONT = "var(--font-sans), system-ui, sans-serif";

const clerkDark = {
  variables: {
    colorPrimary: "#F1EDE4",
    colorTextOnPrimaryBackground: "#0D0D0F",
    colorBackground: "#1F1F21",
    colorText: "#F1EDE4",
    colorTextSecondary: "#A8A49B",
    colorInputBackground: "#131315",
    colorInputText: "#F1EDE4",
    colorNeutral: "#F1EDE4",
    colorDanger: "#E0795F",
    borderRadius: "0.625rem",
    fontFamily: FONT,
  },
  elements: {
    headerTitle: "text-[#F1EDE4]",
    headerSubtitle: "text-[#A8A49B]",
    formFieldLabel: "text-[#F1EDE4]",
    identityPreviewText: "text-[#F1EDE4]",
    footerActionText: "text-[#A8A49B]",
  },
};

const clerkLight = {
  variables: {
    colorPrimary: "#0D0D0F",
    colorTextOnPrimaryBackground: "#F1EDE4",
    colorBackground: "#FAF7F0",
    colorText: "#1C1C1E",
    colorTextSecondary: "#6F6A5F",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1C1C1E",
    colorNeutral: "#1C1C1E",
    colorDanger: "#C2402A",
    borderRadius: "0.625rem",
    fontFamily: FONT,
  },
  elements: {
    headerTitle: "text-[#1C1C1E]",
    headerSubtitle: "text-[#6F6A5F]",
    formFieldLabel: "text-[#1C1C1E]",
    identityPreviewText: "text-[#1C1C1E]",
    footerActionText: "text-[#6F6A5F]",
  },
};

export function ClerkThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const el = document.documentElement;
    const read = () => setTheme(el.classList.contains("light") ? "light" : "dark");
    read();
    const ob = new MutationObserver(read);
    ob.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => ob.disconnect();
  }, []);

  return (
    <ClerkProvider
      appearance={theme === "dark" ? clerkDark : clerkLight}
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
    >
      {children}
    </ClerkProvider>
  );
}
