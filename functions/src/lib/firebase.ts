import { readFileSync } from "node:fs";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (raw) {
    const parsed = JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n")
    };
  }

  if (filePath) {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n")
    };
  }

  return null;
}

const serviceAccount = parseServiceAccount();

const app = getApps().length > 0
  ? getApp()
  : serviceAccount
    ? initializeApp({
        credential: cert(serviceAccount)
      })
    : initializeApp();

export const db = getFirestore(app);
