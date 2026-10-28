import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

// Self-hosted by Next.js (no request to Google at runtime), Latin only to
// keep the download small.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME}: MCQ practice for MBBS exams`,
    template: `%s · ${APP_NAME}`,
  },
  description: "Pera nai, prof-e kop koro. Free MCQ practice for Bangladeshi med students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff6e3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
