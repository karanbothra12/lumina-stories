import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { getBaseUrl } from "@/lib/url";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  themeColor: "#18181b",
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    template: "%s | Lumina",
    default: "Lumina | Stories that matter",
  },
  description: "A space for thinkers, creators, and readers to share and discover compelling stories.",
  keywords: ["blog", "writing", "stories", "community", "lumina", "articles"],
  authors: [{ name: "Lumina Team" }],
  creator: "Lumina",
  publisher: "Lumina",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Lumina | Stories that matter",
    description: "Discover new perspectives, deep dives, and expert knowledge on topics you love.",
    url: getBaseUrl(),
    siteName: "Lumina",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // We'll need to ensure this exists or use a dynamic one
        width: 1200,
        height: 630,
        alt: "Lumina - Stories that matter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina | Stories that matter",
    description: "A space for thinkers, creators, and readers.",
    creator: "@lumina",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: getBaseUrl(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
