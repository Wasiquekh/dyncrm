"use client";

import React, { useEffect, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";
import { RxAvatar } from "react-icons/rx";
import { HiOutlineBookOpen } from "react-icons/hi";
import { toast } from "react-toastify";
import { MdEdit, MdOutlineSubject } from "react-icons/md";
import { FaRegCheckCircle, FaRegClock } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";


type Props = {
  leadId: string;
  reloadKey?: number;
  hitApi: boolean;
  setHitApi: React.Dispatch<React.SetStateAction<boolean>>;
  openEditTask: (task: TaskData) => void;
  openLeadTaskInFlyout: () => void;
  incomingTasks: TaskData[];
};

export interface TaskData {
  id: string;
  assigned_agent_id: string;
  associated_lead: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  details: string;
  location: string;
  organizer_name: string;
  owner_name: string;
  remaining_label: string;
  remaining_minutes: number;
  start_at: string;
  start_at_ist: string;
  end_at: string;
  end_at_ist: string;
  status: string; // string for now
  subject: string;
  timer_hours: number;
  timer_minutes: number;
  type: string; // string for now
  start_at_ca:string;
}

export default function AppCalendar({
  leadId,
  reloadKey = 0,
  hitApi,
  setHitApi,
  openEditTask,
  openLeadTaskInFlyout,
  incomingTasks,
}: Props) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  //console.log("TTTTTTTTTTTTT",tasks)
  // Tracks tasks that were just marked complete in this session
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});


  useEffect(() => {
    setTasks(incomingTasks || []);
    // Initialize completedMap based on incoming status
    const init: Record<string, boolean> = {};
    (incomingTasks || []).forEach((t) => {
      if (isCompletedByStatus(t?.status)) init[t.id] = true;
    });
    setCompletedMap(init);
  }, [incomingTasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await AxiosProvider.post("/leads/tasks/list", {
          lead_id: leadId,
        });
        setTasks(res.data.data.task || []);
       // console.log("AAAAAAAAAAAAAAAAAAAA",res)
        // Rebuild completedMap from API payload too
        const init: Record<string, boolean> = {};
        (res.data?.data?.task || []).forEach((t: TaskData) => {
          if (isCompletedByStatus(t?.status)) init[t.id] = true;
        });
        setCompletedMap(init);
      } catch (e) {
        console.error("Error fetching tasks:", e);
      }
    };
    if (leadId) fetchTasks();
  }, [leadId, reloadKey, hitApi]);

  // helpers
  const isCompletedByStatus = (s?: string) => {
    const x = (s || "").toLowerCase();
    return x === "completed" || x === "done";
  };

  const statusClasses = (s?: string) => {
    const x = (s || "").toLowerCase();
    if (x === "completed" || x === "done")
      return "bg-green-100 text-green-700 border-green-200";
    if (x === "pending" || x === "due")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (x === "cancelled" || x === "canceled" || x === "failed")
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const isTaskLocked = (t: TaskData) =>
    completedMap[t.id] || isCompletedByStatus(t.status);

  const completeTask = async (id: string) => {
    try {
      await AxiosProvider.post("/leads/tasks/complete", {
        lead_id: leadId,
        task_id: id,
      });
      toast.success("Task marked as completed");
      // Optimistic local lock + refresh trigger
      setCompletedMap((m) => ({ ...m, [id]: true }));
      setHitApi(!hitApi);
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Task not completed");
    }
  };

  return (
 <div className="relative overflow-x-auto w-full sm:rounded-lg  text-white">
  <table className="w-full text-sm text-left whitespace-nowrap">
    <thead className="text-xs talbleheaderBg text-white">
      <tr className="  ">
        <th className="px-3 py-3 md:p-3    font-semibold text-white text-base">
          <div className="flex items-center gap-2">
            <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Name - Mail</span>
          </div>
        </th>
        <th className="px-3 py-2    hidden md:table-cell font-semibold text-white text-base">
          <div className="flex items-center gap-2">
            <MdOutlineSubject  className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Subject</span>
          </div>
        </th>
        <th className="px-3 py-2    hidden md:table-cell font-semibold text-white text-base">
          <div className="flex items-center gap-2">
            <FaRegClock  className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Status</span>
          </div>
        </th>
        <th className="px-3 py-2    hidden md:table-cell font-semibold text-white text-base">
          <div className="flex items-center gap-2">
            <FaRegCheckCircle  className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Done</span>
          </div>
        </th>
        <th className="px-3 py-2    hidden md:table-cell font-semibold text-white text-base">
          <div className="flex items-center gap-2">
            <IoSettingsOutline  className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Action</span>
          </div>
        </th>
      </tr>
    </thead>

    <tbody>
      {!tasks || tasks.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-6 text-gray-400">
            Data not found
          </td>
        </tr>
      ) : (
        tasks.map((t, index) => {
          const locked = isTaskLocked(t);
          return (
            <tr
              key={t?.id ?? index}
              className="    hover:bg-primary-600 transition-colors border-b border-[#E7E7E7] odd:bg-[#404040]"
            >
              {/* Start Date */}
              <td className="px-1 py-2 md:px-3 md:py-2 border-tableBorder">
                <p className="text-white text-sm sm:text-base">{t?.start_at_ca || "-"}</p>
              </td>

              {/* Subject */}
              <td className="px-3 py-2    hidden md:table-cell">
                <p className="text-white text-sm sm:text-base capitalize">{t?.subject || "-"}</p>
                <p className="text-gray-300 text-xs">{t?.details || "-"}</p>
              </td>

              {/* Status pill */}
              <td className="px-3 py-2    hidden md:table-cell">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusClasses(
                    t?.status
                  )}`}
                >
                  {(t?.status || "-").toString().toLowerCase()}
                </span>
              </td>

              {/* Done checkbox */}
              <td className="px-3 py-2    hidden md:table-cell">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary-600 cursor-pointer disabled:cursor-not-allowed"
                    checked={locked}
                    disabled={locked}
                    onChange={async (e) => {
                      if (e.target.checked && !locked) {
                        await completeTask(t.id);
                      }
                    }}
                    aria-label="Mark task as completed"
                  />
                </label>
              </td>

     {/* Action */}
<td className="px-3 py-2    hidden md:table-cell">
  <button
    type="button"
    onClick={() => !locked && openEditTask(t)}
    disabled={locked}
    className={`px-3 py-1 rounded-[4px] text-sm font-medium 
      text-white hover:text-white hover:underline
      disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {/* Edit */}
    <MdEdit />
  </button>
</td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

  );
}
