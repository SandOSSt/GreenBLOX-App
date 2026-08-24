import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ClientErrorBoundary } from "@/components/greenblox/ClientErrorBoundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GreenBlox Studio",
  description: "GreenBlox is a sandbox game engine and editor shell with real-time WebGL rendering, ECS runtime, Lua scripting, physics, and project persistence.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-[#0f1014] text-white antialiased`}>
        <ClientErrorBoundary>{children}</ClientErrorBoundary>
      </body>
    </html>
  );
}
