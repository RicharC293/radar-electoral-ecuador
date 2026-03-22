import type { Metadata } from "next";

import { ResultsPageShell } from "@/components/results/ResultsPageShell";
import { getPollBySlug, getPollCandidates } from "@/lib/firebase/firestore";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const poll = await getPollBySlug(slug);

  if (!poll) {
    return {
      title: "Resultados no encontrados",
    };
  }

  const candidates = await getPollCandidates(poll.id);
  const activeNames = candidates
    .filter((c) => c.isActive)
    .map((c) => c.fullName);

  const province = poll.province ?? "";
  const candidateList = activeNames.join(", ");

  const title = province
    ? `Resultados Sondeo ${province}: ${poll.title}`
    : `Resultados: ${poll.title}`;

  const description = candidateList
    ? `Resultados en tiempo real del sondeo "${poll.title}"${province ? ` en ${province}` : ""}. Candidatos: ${candidateList}. ${poll.totalVotes} opiniones registradas. Sondeo ciudadano informativo.`
    : `Consulta los resultados en tiempo real de "${poll.title}". ${poll.totalVotes} opiniones registradas. Sondeo ciudadano informativo.`;

  const keywords = [
    `resultados ${poll.title.toLowerCase()}`,
    `sondeo ${poll.title.toLowerCase()}`,
    ...(province
      ? [
          `elecciones ${province.toLowerCase()}`,
          `candidatos ${province.toLowerCase()}`,
          `sondeo ${province.toLowerCase()}`,
          `encuesta ${province.toLowerCase()}`,
          `resultados ${province.toLowerCase()}`,
          `votación ${province.toLowerCase()}`,
        ]
      : []),
    ...activeNames,
    "radar electoral",
    "sondeo ciudadano",
    "resultados en vivo",
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
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 md:px-10">
      <ResultsPageShell slug={slug} />
    </main>
  );
}
