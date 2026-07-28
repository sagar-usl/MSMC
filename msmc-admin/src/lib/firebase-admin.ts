import "server-only";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const globalForFirebaseAdmin = globalThis as unknown as {
  firebaseAdminApp?: ReturnType<typeof initializeApp>;
};

function createFirebaseAdminApp() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not set");

  const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(serviceAccountPath), "utf-8")
  );

  return initializeApp({ credential: cert(serviceAccount) });
}

const firebaseAdminApp =
  globalForFirebaseAdmin.firebaseAdminApp ?? getApps()[0] ?? createFirebaseAdminApp();

if (process.env.NODE_ENV !== "production") {
  globalForFirebaseAdmin.firebaseAdminApp = firebaseAdminApp;
}

export const messaging = getMessaging(firebaseAdminApp);
