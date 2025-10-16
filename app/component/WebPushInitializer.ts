// app/components/WebPushInitializer.tsx
"use client";

import { useEffect } from "react";
import { setupServiceWorker } from "./utils/setupServiceWorker";

const WebPushInitializer = () => {
  useEffect(() => {
    setupServiceWorker();
  }, []); // Empty dependency array means this runs only once on mount

  return null;
};

export default WebPushInitializer;
