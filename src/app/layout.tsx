import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const csp = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "media-src 'none'",
].join("; ");

export const metadata: Metadata = {
  title: {
    default: "Salesforce Interview Prep",
    template: "%s · Interview Prep",
  },
  description:
    "Independent interview handbook — 148 Salesforce modules with lessons, diagrams, flashcards, and cheat sheets.",
  applicationName: "Salesforce Interview Prep",
  openGraph: {
    title: "Salesforce Interview Prep",
    description:
      "Source-grounded Salesforce interview prep — terms, lessons, practice, and cheat sheets.",
    type: "website",
    siteName: "Salesforce Interview Prep",
  },
  other: {
    "Content-Security-Policy": csp,
  },
};

export const viewport: Viewport = {
  themeColor: "#0176D3",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${plexMono.variable} h-full`}
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
