import { readFileSync } from "node:fs";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (raw) {
    return JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  }

  if (filePath) {
    return JSON.parse(readFileSync(filePath, "utf8")) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  }

  return null;
}

const serviceAccount = parseServiceAccount();

const adminApp =
  getApps().length > 0
    ? getApp()
    : serviceAccount
      ? initializeApp({
          credential: cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key.replace(/\\n/g, "\n")
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        })
      : initializeApp({
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
