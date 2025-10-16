// app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { ReactNode, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
//import WebPushBootstrapper from "./component/WebPushBootstrapper";
import NotificationListener from "./NotificationListener";
const WebPushInitializer = dynamic(
  () => import("./component/WebPushInitializer"),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Lead CRM",
//   description: "",
// };

// Client-only chunks
const ErrorBoundary = dynamic(() => import("./ErrorBoundary"), { ssr: false });
const AppProvider = dynamic(
  () => import("./AppContext").then((mod) => mod.AppProvider),
  { ssr: false }
);
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

// 👉 Sidebar as client-only (safe if it uses hooks, router, localStorage, etc.)
const LeftSideBar = dynamic(() => import("./component/LeftSideBar"), {
  ssr: false,
});

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AppProvider>
            {/* Page shell: sidebar + main content */}
            <div className="min-h-dvh flex">
              {/* Sidebar column */}

              {/* Main content column */}
              <main className="flex-1 min-w-0">{children}</main>
            </div>
            <NotificationListener />
            {/* Toasts */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AppProvider>
          <WebPushInitializer></WebPushInitializer>
        </ErrorBoundary>
      </body>
    </html>
  );
}