import type { Metadata } from "next";

import { PublicHomeShell } from "@/components/home/PublicHomeShell";
import { getPublicPolls, getPollCandidates } from "@/lib/firebase/firestore";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const polls = await getPublicPolls();

    // Collect all candidate names and provinces
    const candidateNames: string[] = [];
    const provinces = new Set<string>();

    for (const poll of polls) {
      if (poll.province) provinces.add(poll.province);
      const candidates = await getPollCandidates(poll.id);
      for (const c of candidates) {
        if (c.isActive) candidateNames.push(c.fullName);
      }
    }

    const provinceList = Array.from(provinces).join(", ");
    const candidateList = candidateNames.join(", ");

    const title = provinceList
      ? `Sondeo Ciudadano ${provinceList} · Candidatos y Resultados en Tiempo Real`
      : "Radar Electoral · Sondeo Ciudadano en Tiempo Real";

    const description = candidateNames.length > 0
      ? `¿Quién lidera la intención de voto en ${provinceList || "tu provincia"}? Conoce a ${candidateList}. Participa en el sondeo ciudadano y consulta resultados en tiempo real.`
      : "Conoce quiénes lideran la intención de voto en tu provincia. Participa en el sondeo ciudadano y consulta resultados en tiempo real.";

    const keywords = [
      "elecciones ecuador",
      "candidatos ecuador",
      "sondeo electoral",
      "intención de voto",
      "radar electoral",
      "encuesta ciudadana",
      "resultados electorales",
      "elecciones 2025",
      "votación ecuador",
      ...Array.from(provinces).flatMap((p) => [
        `elecciones ${p.toLowerCase()}`,
        `candidatos ${p.toLowerCase()}`,
        `alcaldía ${p.toLowerCase()}`,
        `sondeo ${p.toLowerCase()}`,
        `encuesta ${p.toLowerCase()}`,
        `votación ${p.toLowerCase()}`,
      ]),
      ...candidateNames,
    ];

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "es_EC",
        siteName: "Radar Electoral",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    // Fallback if Firebase is unavailable
    return {};
  }
}

export default function HomePage() {
  return <PublicHomeShell />;
}
