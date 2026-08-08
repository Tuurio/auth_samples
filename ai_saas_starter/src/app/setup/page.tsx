import type { Metadata } from "next";
import { SetupGuide } from "@/components/setup-guide";

export const metadata: Metadata = { title: "Set up Tuurio ID" };

export default function SetupPage() { return <SetupGuide />; }
