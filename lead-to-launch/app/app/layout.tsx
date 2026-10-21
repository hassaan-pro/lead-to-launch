import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const sans = Geist({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Lead to Launch", template: "%s | Lead to Launch" },
  description: "Find local businesses with weak websites, audit them with evidence, design a sample site for each, and write the pitch.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#ECE8DF",
    colorTextOnPrimaryBackground: "#0A0E13",
    colorBackground: "#10161E",
    colorText: "#ECE8DF",
    colorTextSecondary: "#8D96A1",
    colorInputBackground: "#0A0E13",
    colorInputText: "#ECE8DF",
    colorNeutral: "#ECE8DF",
    colorDanger: "#E0795F",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={clerkAppearance} signInFallbackRedirectUrl="/app" signUpFallbackRedirectUrl="/app">
      <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} dark h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Toaster position="bottom-right" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
