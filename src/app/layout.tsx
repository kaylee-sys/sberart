import { cn } from "@/lib/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sber Art Lab",
  description:
    "Sber Art Lab — социальная сеть. Публикуйте арты, делитесь промтами, подписывайтесь и общайтесь.",
  applicationName: "Sber Art Lab",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sber Art Lab",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0C",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-[#0A0A0C] font-sans text-[#F5F7FA] antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
