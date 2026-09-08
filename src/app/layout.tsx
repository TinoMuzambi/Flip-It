import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Flip-It — focused flashcards",
  description:
    "Create private flashcards, run focused study sessions, and keep your deck in your browser.",
  applicationName: "Flip-It",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Flip-It — focused flashcards",
    description: "A private, local-first study desk for the things worth remembering.",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#3157d5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
