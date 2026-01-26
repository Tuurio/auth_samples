"use client";

import type { ReactNode } from "react";

export function Card({
  children,
  tone = "solid",
}: {
  children: ReactNode;
  tone?: "solid" | "soft" | "panel";
}) {
  return <section className={`card card-${tone}`}>{children}</section>;
}
