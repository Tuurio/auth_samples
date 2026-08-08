import type { Metadata } from "next";
import { DemoWorkspace } from "@/components/demo-workspace";

export const metadata: Metadata = { title: "Local product demo" };

export default function DemoPage() { return <DemoWorkspace />; }
