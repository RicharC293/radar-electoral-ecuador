import type { MetadataRoute } from "next";

import { adminDb } from "@/lib/firebase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://radarelectoral.ec";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/resultados`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic poll results pages
  const pollPages: MetadataRoute.Sitemap = [];

  try {
    const snapshot = await adminDb
      .collection("polls")
      .where("isPublic", "==", true)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      pollPages.push({
        url: `${baseUrl}/resultados/${data.slug}`,
        lastModified: data.updatedAt?.toDate() ?? new Date(),
        changeFrequency: "always",
        priority: 0.8,
      });
    }
  } catch {
    // If Firebase is unavailable, return only static pages
  }

  return [...staticPages, ...pollPages];
}
