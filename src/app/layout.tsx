import type { Metadata, Viewport } from "next";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import { Navbar } from "@/components/Navbar";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Grain } from "@/components/Grain";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Aayu - every year, held well",
  description:
    "Track the people in your life, get reminded before their birthday, and send a wish that actually fits them.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aayu",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4efe4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Grain />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
