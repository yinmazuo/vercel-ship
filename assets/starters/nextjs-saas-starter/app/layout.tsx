import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OrbitDesk",
  description: "A dashboard starter for Vercel ship demos."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <html lang="en">
      <body>{hasClerk ? <ClerkProvider>{children}</ClerkProvider> : children}</body>
    </html>
  );
}
