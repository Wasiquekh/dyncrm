// app/utils/setupServiceWorker.ts
export function setupServiceWorker() {
  // Check if the browser supports service workers
  if ("serviceWorker" in navigator) {
    // Register the service worker file. The path is relative to the root URL.
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  }
}
