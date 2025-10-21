"use client";

import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { messaging } from "./firebase-config";

// The base URL should be configured using environment variables.
const APP_BASE_URL =
  // process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
  process.env.NEXT_PUBLIC_APP_BASE_URL ||
  " https://main.d3at4891k8lx4d.amplifyapp.com";
 

const NotificationListener = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the code is running in a browser before adding the listener
    if (typeof window !== "undefined" && messaging) {
      // Handle foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("📩 Notification received (foreground):", payload);

        const { notification, data } = payload;
        const title = notification?.title || "Notification";
        const body = notification?.body || "Click to view details.";
        const leadId = data?.lead_id || data?.sample_lead_id || null;

        const notificationUrl = leadId
          ? `${APP_BASE_URL}/leadsdetails?id=${encodeURIComponent(leadId)}`
          : null;

        // Use a toast notification for a better user experience
        toast.info(body, {
          autoClose: 5000,
          onClick: () => {
            // Use Next.js router for a smoother client-side navigation
            if (notificationUrl) {
              router.push(notificationUrl);
            }
          },
          closeOnClick: true,
          pauseOnHover: true,
        });
      });

      // Return the unsubscribe function for cleanup
      return () => unsubscribe();
    }
  }, [router]);

  return null;
};

export default NotificationListener;
