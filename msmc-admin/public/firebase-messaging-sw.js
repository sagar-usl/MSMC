importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA8VPw_EjE5kYjBnWSlIrX0O_jbrlC3XD0",
  authDomain: "msmc-25cad.firebaseapp.com",
  projectId: "msmc-25cad",
  storageBucket: "msmc-25cad.firebasestorage.app",
  messagingSenderId: "405108823869",
  appId: "1:405108823869:web:1c1825368ad56a3ea49754",
});

firebase.messaging();

// Firebase auto-displays background notifications using the payload's
// `notification` field, carrying the `data` payload (e.g. ticketId) onto
// `event.notification.data`. This click handler is what makes that
// auto-displayed notification actually navigate somewhere — without it,
// clicking does nothing.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const ticketId = event.notification.data?.ticketId;
  const targetPath = ticketId ? `/complaints/${encodeURIComponent(ticketId)}` : "/feedback";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const targetUrl = new URL(targetPath, self.location.origin).href;
      for (const client of windowClients) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      for (const client of windowClients) {
        if ("navigate" in client && "focus" in client) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
