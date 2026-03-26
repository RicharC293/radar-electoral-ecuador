import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://radarelectoral.ec";

export const viewport: Viewport = {
  themeColor: "#0f1117",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Radar Electoral · Sondeo Ciudadano en Tiempo Real",
    template: "%s · Radar Electoral",
  },
  description:
    "Conoce quiénes lideran la intención de voto en Latacunga y tu provincia. Participa en el sondeo ciudadano y consulta resultados en tiempo real.",
  keywords: [
    "elecciones ecuador",
    "candidatos ecuador",
    "sondeo electoral",
    "intención de voto",
    "radar electoral",
    "encuesta ciudadana",
    "resultados electorales",
    "elecciones 2025",
    "votación ecuador",
    "elecciones latacunga",
    "candidatos latacunga",
    "alcaldía latacunga",
    "sondeo latacunga",
    "encuesta latacunga",
    "votación latacunga",
    "elecciones cotopaxi",
    "candidatos cotopaxi",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  authors: [{ name: "Radar Electoral" }],
  creator: "Radar Electoral",
  openGraph: {
    title: "Radar Electoral · Sondeo Ciudadano en Tiempo Real",
    description:
      "Participa en el sondeo ciudadano y consulta los resultados de intención de voto en tiempo real.",
    type: "website",
    locale: "es_EC",
    siteName: "Radar Electoral",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radar Electoral · Sondeo Ciudadano en Tiempo Real",
    description:
      "Participa en el sondeo ciudadano y consulta los resultados de intención de voto en tiempo real.",
  },
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
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Radar Electoral",
              url: siteUrl,
              description:
                "Sondeo ciudadano en tiempo real sobre candidatos a alcaldía de Latacunga y otros cargos de elección popular en Ecuador.",
              applicationCategory: "SocialApplication",
              operatingSystem: "All",
              inLanguage: "es",
              countryOfOrigin: {
                "@type": "Country",
                name: "Ecuador",
              },
              disclaimer:
                "Radar informativo. No reemplaza ningún proceso electoral oficial.",
            }),
          }}
        />
      </head>
      <body>
        <ToastProvider>
          {children}
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-6">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-2 px-4 text-center">
        <p className="text-[11px] leading-relaxed text-white/20">
          Radar informativo · No reemplaza ningún proceso electoral oficial
        </p>
        <p className="text-[11px] text-white/15">
          Un producto de Norva Company
        </p>
        <div className="flex gap-3 text-[11px] text-white/25">
          <Link href="/terminos" className="underline underline-offset-2 hover:text-white/45">
            Términos y Condiciones
          </Link>
          <span>·</span>
          <Link href="/privacidad" className="underline underline-offset-2 hover:text-white/45">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
