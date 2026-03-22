import type { Metadata } from "next";

import { ImmersiveLiveView } from "@/components/results/ImmersiveLiveView";
import { getPublicPolls, getPollCandidates } from "@/lib/firebase/firestore";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const polls = await getPublicPolls();

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
      ? `Resultados en Vivo · Sondeo Electoral ${provinceList}`
      : "Resultados en Vivo · Radar Electoral";

    const description = candidateList
      ? `Resultados en tiempo real del sondeo ciudadano${provinceList ? ` en ${provinceList}` : ""}. Candidatos: ${candidateList}. Datos actualizados al instante.`
      : "Consulta los resultados del sondeo ciudadano en tiempo real. Datos actualizados al instante con cada opinión registrada.";

    return {
      title,
      description,
      keywords: [
        `resultados electorales${provinceList ? ` ${provinceList.toLowerCase()}` : ""}`,
        "sondeo en vivo",
        "resultados en tiempo real",
        ...Array.from(provinces).flatMap((p) => [
          `resultados ${p.toLowerCase()}`,
          `elecciones ${p.toLowerCase()}`,
        ]),
        ...candidateNames,
      ],
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
    return {
      title: "Resultados en Vivo",
      description:
        "Consulta los resultados del sondeo ciudadano en tiempo real.",
    };
  }
}

export default function ResultadosPage() {
  return <ImmersiveLiveView />;
}
