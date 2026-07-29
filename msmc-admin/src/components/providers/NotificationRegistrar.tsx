"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "@/lib/firebase";

/**
 * Requests browser notification permission and registers this device's FCM
 * token against the logged-in officer, so new-complaint alerts can be
 * pushed to the admin panel. Mounted once in the officer-only app layout.
 */
export function NotificationRegistrar() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

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

      // Pushes that arrive while this tab is focused are delivered here,
      // not to the service worker (that's foreground vs. background FCM
      // delivery) — without this handler they'd never be shown at all.
      unsubscribe = onMessage(messaging, (payload) => {
        const { title, body } = payload.notification ?? {};
        if (!title) return;
        const notification = new Notification(title, { body });
        notification.onclick = () => {
          window.focus();
          const ticketId = payload.data?.ticketId;
          router.push(ticketId ? `/complaints/${encodeURIComponent(ticketId)}` : "/feedback");
          notification.close();
        };
      });
    }

    register().catch((err) => console.error("Notification registration failed:", err));

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [router]);

  return null;
}
