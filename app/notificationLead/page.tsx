"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AxiosProvider from "@/provider/AxiosProvider";

export default function NotificationLeadPage() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const [notificationLead, setNotificationLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await AxiosProvider.post("/leads/get", { lead_id: id });
        setNotificationLead(res.data.data);
      } catch (e) {
        console.error("Failed to fetch notification lead:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) return <p>Missing lead id.</p>;
  if (loading) return <p>Loading...</p>;
  if (!notificationLead) return <p>No lead found.</p>;

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-2">
        Lead #{notificationLead.lead_number}
      </h1>
      <p><b>Name:</b> {notificationLead.full_name}</p>
      <p><b>Email:</b> {notificationLead.email}</p>
      <p><b>Phone:</b> {notificationLead.phone}</p>
      {/* Add any more fields you want to show */}
    </div>
  );
}
