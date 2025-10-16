"use client";
import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  isSupported,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  return (await isSupported()) ? getMessaging(app) : null;
}

export async function ensureSwRegistered() {
  if ("serviceWorker" in navigator) {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  }
  return null;
}

export async function fetchFcmToken(): Promise<string | null> {
  const msg = await getMessagingIfSupported();
  if (!msg) return null;
  const reg = await ensureSwRegistered();
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return null;
  return await getToken(msg, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    serviceWorkerRegistration: reg!,
  });
}

export function onForegroundMessage(cb: (payload: any) => void) {
  getMessagingIfSupported().then((msg) => {
    if (msg) onMessage(msg, (payload) => cb(payload));
  });
}
