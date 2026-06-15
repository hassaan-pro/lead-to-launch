import type { Metadata } from "next";
import { Inter, Calistoga, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const calistoga = Calistoga({ variable: "--font-display", subsets: ["latin"], weight: "400", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Lead → Launch",
  description: "Scrape → Audit → Rank → Build → Outreach. One Claude skill.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          <header className="flex justify-end items-center px-6 py-3 border-b border-border">
            <UserButton afterSignOutUrl="/sign-in" />
          </header>
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
