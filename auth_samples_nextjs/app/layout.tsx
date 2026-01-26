import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuurio Auth Next.js Demo",
  description: "Next.js demo that signs in with OAuth 2.1 / OpenID Connect.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
