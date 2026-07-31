import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { SearchModal } from "@/components/search/SearchModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Community | CSCPDUAMA",
    template: "%s | CSCPDUAMA",
  },
  description:
    "Official community discussion platform for the Department of Computer Science, PDUAM. Connect, collaborate, share projects, and ask questions powered by GitHub Discussions.",
  keywords: [
    "CSCPDUAMA",
    "CSCPDUAM",
    "PDUAM",
    "Computer Science",
    "Department of Computer Science",
    "Tulungia",
    "Community",
    "GitHub Discussions",
    "Tech Discussions",
    "Programming",
  ],
  authors: [{ name: "Department of Computer Science, PDUAM" }],
  creator: "CSCPDUAMA Community",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://community.cscpduam.org",
    title: "Community | CSCPDUAMA",
    description:
      "Official community discussion platform for the Department of Computer Science, PDUAM.",
    siteName: "Community | CSCPDUAMA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community | CSCPDUAMA",
    description:
      "Official community discussion platform for the Department of Computer Science, PDUAM.",
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://community.cscpduam.org"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans`}
    >
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Providers>
          {/* Accessibility Skip Link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Skip to main content
          </a>

          {/* Sticky Header Navigation */}
          <Navbar />

          {/* Search Popup Modal */}
          <SearchModal />

          {/* Application Main Layout Wrapper */}
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>

          {/* Site Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
