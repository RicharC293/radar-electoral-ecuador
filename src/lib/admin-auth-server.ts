import { NextResponse } from "next/server";

import { adminAuth } from "@/lib/firebase/admin";

function parseAllowedEmails() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  return email || null;
}

function extractBearerToken(headerValue: string | null) {
  if (!headerValue?.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice("Bearer ".length).trim();
}

export async function requireAdmin(request: Request) {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Missing authorization token." }, { status: 401 })
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const allowedEmail = parseAllowedEmails();
    const email = decoded.email?.toLowerCase() ?? "";
    const provider = decoded.firebase?.sign_in_provider ?? null;
    const isPasswordUser = provider === "password";
    const isAllowed = allowedEmail
      ? Boolean(isPasswordUser && email === allowedEmail)
      : isPasswordUser;

    if (!isAllowed) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: "Admin access denied." },
          { status: 403 }
        )
      };
    }

    return {
      ok: true as const,
      decoded
    };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid authorization token." }, { status: 401 })
    };
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
