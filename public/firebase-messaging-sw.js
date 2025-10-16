"use client";
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDq8IQ89z1cW4UCdnoDmH0xrf0AefyF6vI", // Replace with your Firebase API Key
  authDomain: "manage-lead-crm.firebaseapp.com", // Replace with your Firebase Auth domain
  projectId: "manage-lead-crm", // Replace with your Firebase Project ID
  storageBucket: "manage-lead-crm.firebasestorage.app", // Replace with your Firebase storage bucket
  messagingSenderId: "710494034011", // Replace with your Sender ID
  appId: "1:710494034011:web:86a614c36a3d8e6154c77e", // Replace with your App ID
  measurementId: "G-J71349ZJQ0", // Replace with your Measurement ID
});

// const app = initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background notification received:", payload);

  const { notification, data } = payload;
  const title = notification?.title || "Notification";
  const body = notification?.body || "You have a new message.";

  const leadId = data?.lead_id || data?.sample_lead_id || null;

  // Display a custom notification with the payload data
  self.registration.showNotification(title, {
    body,
    icon: "/path/to/icon.png", // Specify the path to your icon
    data: {
      url: leadId ? `/leadsdetails?id=${encodeURIComponent(leadId)}` : "/",
    },
  });
});

// Handle the notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  // Close the notification
  event.notification.close();

  // Retrieve the URL from the notification's data payload
  const notificationUrl = event.notification.data?.url || "/";

  // This prevents the browser from closing the service worker before the window is opened
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if a client (window) with the URL is already open
      for (const client of clientList) {
        if (client.url.includes(notificationUrl) && "focus" in client) {
          return client.focus();
        }
      }

      // If no existing client is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(notificationUrl);
      }
    })
  );
});