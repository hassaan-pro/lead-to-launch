"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dark / light switch. Dark is the default and the server-rendered class;
 * the inline script in the root layout applies a saved "light" choice
 * before first paint, and this toggle flips the class on <html> and
 * persists the choice. Token values for both themes live in globals.css.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    const el = document.documentElement;
    el.classList.remove("dark", "light");
    el.classList.add(next);
    try {
      localStorage.setItem("outrive-theme", next);
    } catch {
      /* storage unavailable (private mode): the flip still applies for this visit */
    }
    setTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="h-9 w-9 rounded-full"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
    </Button>
  );
}
