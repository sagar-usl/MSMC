"use client";

import { useEffect } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from "@/lib/firebase";

/**
 * Requests browser notification permission and registers this device's FCM
 * token against the logged-in officer, so new-complaint alerts can be
 * pushed to the admin panel. Mounted once in the officer-only app layout.
 */
export function NotificationRegistrar() {
  useEffect(() => {
    let cancelled = false;

    async function register() {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted" || cancelled) return;

      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const messaging = getMessaging(firebaseApp);
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (!token || cancelled) return;

      await fetch("/api/notifications/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, platform: "web" }),
      });
    }

    register().catch((err) => console.error("Notification registration failed:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
