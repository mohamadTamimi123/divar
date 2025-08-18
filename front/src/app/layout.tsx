import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/webfonts/css/style.css"
import { FiltersProvider } from "../context/FiltersContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "پلتفرم املاک - بهترین فرصت‌های سرمایه‌گذاری",
  description: "بهترین فرصت‌های سرمایه‌گذاری در املاک - خرید، فروش و اجاره املاک",
  keywords: ["املاک", "خرید ملک", "فروش ملک", "اجاره ملک", "سرمایه‌گذاری"],
  authors: [{ name: "پلتفرم املاک" }],
  creator: "پلتفرم املاک",
  publisher: "پلتفرم املاک",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "پلتفرم املاک - بهترین فرصت‌های سرمایه‌گذاری",
    description: "بهترین فرصت‌های سرمایه‌گذاری در املاک",
    url: 'https://your-domain.com',
    siteName: 'پلتفرم املاک',
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "پلتفرم املاک - بهترین فرصت‌های سرمایه‌گذاری",
    description: "بهترین فرصت‌های سرمایه‌گذاری در املاک",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'پلتفرم املاک',
  },
  applicationName: 'پلتفرم املاک',
  category: 'business',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="application-name" content="پلتفرم املاک" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="پلتفرم املاک" />
        <meta name="description" content="بهترین فرصت‌های سرمایه‌گذاری در املاک" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        
        <link rel="apple-touch-icon" href="/cropped-New-Project-4.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/cropped-New-Project-4.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/cropped-New-Project-4.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/cropped-New-Project-4.png" color="#3b82f6" />
        <link rel="shortcut icon" href="/cropped-New-Project-4.png" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://your-domain.com" />
        <meta name="twitter:title" content="پلتفرم املاک" />
        <meta name="twitter:description" content="بهترین فرصت‌های سرمایه‌گذاری در املاک" />
        <meta name="twitter:image" content="https://your-domain.com/cropped-New-Project-4.png" />
        <meta name="twitter:creator" content="@yourusername" />
        <meta name="twitter:site" content="@yourusername" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="پلتفرم املاک" />
        <meta property="og:description" content="بهترین فرصت‌های سرمایه‌گذاری در املاک" />
        <meta property="og:site_name" content="پلتفرم املاک" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:image" content="https://your-domain.com/cropped-New-Project-4.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FiltersProvider>
          {children}
        </FiltersProvider>
      </body>
    </html>
  );
}
