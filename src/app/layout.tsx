import type { Metadata, Viewport } from "next";
import { DM_Sans, Parkinsans } from "next/font/google";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

// Self-hosted by Next.js (no request to Google at runtime), Latin only to
// keep the download small.
// Body text.
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
// Headings, buttons and big numbers.
const parkinsans = Parkinsans({ subsets: ["latin"], variable: "--font-parkinsans" });

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME}: MCQ practice for MBBS exams`,
    template: `%s · ${APP_NAME}`,
  },
  description: "Free exam-style MCQ practice for MBBS students in Bangladesh.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${parkinsans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
