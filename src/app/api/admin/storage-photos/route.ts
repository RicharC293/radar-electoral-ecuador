import { NextResponse } from "next/server";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminStorage } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const bucket = adminStorage.bucket();
  const [files] = await bucket.getFiles({ prefix: "polls/" });

  const photos = files
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
    .map((file) => {
      const token =
        file.metadata?.metadata?.firebaseStorageDownloadTokens ?? "";
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`;

      return {
        path: file.name,
        url,
        size: Number(file.metadata?.size ?? 0),
        created: file.metadata?.timeCreated ?? null,
      };
    })
    .sort((a, b) => {
      if (!a.created || !b.created) return 0;
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });

  return NextResponse.json({ photos });
}
