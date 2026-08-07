import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Tuurio Canvas — AI workspace starter", template: "%s · Tuurio Canvas" },
  description: "A production-oriented multi-tenant AI SaaS starter with Tuurio ID.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
