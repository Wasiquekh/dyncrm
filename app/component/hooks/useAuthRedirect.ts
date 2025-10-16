"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StorageManager from "../../../provider/StorageManager";
import { isTokenExpired } from "../utils/authUtils";

/**
 * Returns true while checking; false once done.
 * NOTE: Never clears StorageManager or localStorage (per your request).
 */
export const useAuthRedirect = (): boolean => {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const storage = new StorageManager(); // Using your StorageManager

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read token from StorageManager (it will read from localStorage)
    const token = storage.getAccessToken();

    let invalid = !token || token === "null" || token.trim() === "";

    if (!invalid) {
      try {
        invalid = isTokenExpired(token);  // Check if the token is expired
      } catch {
        // if parsing fails, treat as invalid (still do not clear storage)
        invalid = true;
      }
    }

    if (invalid) {
      localStorage.clear(); // Clear localStorage if token is invalid or expired
      // Do NOT clear StorageManager; just redirect.
      router.replace("/"); // Redirect to login or home page
      setChecking(false);
      return;
    }

    setChecking(false); // If token is valid, proceed with normal flow
  }, [router]);

  return checking; // Return checking state for loading purposes
};
