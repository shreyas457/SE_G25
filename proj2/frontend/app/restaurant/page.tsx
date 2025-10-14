import ScrollUp from "@/components/Common/ScrollUp";
import Features from "@/components/Features";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Next.js Template for Startup and SaaS",
  description: "This is Home for Startup Nextjs Template",
  // other metadata
};

export default function CustomerPage() {
  return (
    <>
      <ScrollUp />
      <Features />
    </>
  );
}
