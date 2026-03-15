import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreAuthProvider } from "@/contexts/StoreAuthContext";

const inter = Inter({
  variable: "--font-sans-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#BE2635",
};

export const metadata: Metadata = {
  title: "Ghimire Kitchen Wares - Online Store",
  description: "Shop quality kitchen wares online from Ghimire Kitchen Wares. Browse our wide collection of premium kitchen products delivered to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <StoreAuthProvider>{children}</StoreAuthProvider>
      </body>
    </html>
  );
}
