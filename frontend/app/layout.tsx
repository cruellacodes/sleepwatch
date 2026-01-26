import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airplane Sleep Watch | Global Geopolitical Activity Tracker",
  description: "Advanced tracking of government and military aircraft movements. Real-time geopolitical risk analysis and panic scoring.",
  openGraph: {
    title: "Airplane Sleep Watch",
    description: "Real-time global geopolitical risk tracking via aircraft movements.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airplane Sleep Watch",
    description: "Global government/military aircraft tracking & risk analysis.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-app-bg text-gray-100 selection:bg-tech-blue/30 selection:text-white min-h-screen">
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-[0.03]"></div>
        {children}
      </body>
    </html>
  );
}
