import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OfflineSync } from "@/components/OfflineSync";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrainDump — 쏟아내면, AI가 정리합니다",
  description:
    "텍스트, 음성, 사진, PDF — 뭐든 던지세요. AI가 할 일, 일정, 메모, 아이디어로 자동 분류합니다. iOS 앱 & 데스크탑 웹.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "BrainDump — 쏟아내면, AI가 정리합니다",
    description:
      "텍스트, 음성, 사진, PDF — 뭐든 던지세요. AI가 할 일, 일정, 메모, 아이디어로 자동 분류합니다.",
    url: "https://braindump-jet.vercel.app",
    siteName: "BrainDump",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainDump — 쏟아내면, AI가 정리합니다",
    description:
      "텍스트, 음성, 사진, PDF — 뭐든 던지세요. AI가 자동 분류합니다.",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <OfflineSync />
          <ServiceWorkerRegistration />
        </AuthProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
