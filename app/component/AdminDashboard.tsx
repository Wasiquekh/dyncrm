import React, { useEffect, useMemo, useRef, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";

/* ---------- Types ---------- */
type CardCounts = {
  cancelled_today: number;
  done_today: number;
  overdue_all: number;
  pending_today: number;
  today_ca: string;
  total_today: number;
};

type TaskRow = {
  lead_id: string | number;
  lead_name: string;
  status?: string;
  due_date?: string;
  start_at_ca?: string;
  end_at_ca?: string;
};

type AgentTasks = {
  agent_id: string;
  agent_name: string;
  total_today?: number;
  pending_today?: number;
  done_today?: number;
  overdue?: number;
  tasks?: TaskRow[];
};

type AdminDashResponse = {
  data?: {
    cards?: Partial<CardCounts> & { team_tasks?: Partial<CardCounts> };
    tables?: {
      team_tasks_by_agent?: AgentTasks[];
    };
    lists?: {
      today_tasks_by_agent?: AgentTasks[];
      overdue_tasks_by_agent?: AgentTasks[];
    };
  };
};

const DEFAULT_CARDS: CardCounts = {
  cancelled_today: 0,
  done_today: 0,
  overdue_all: 0,
  pending_today: 0,
  today_ca: "",
  total_today: 0,
};

const AdminDashboard: React.FC = () => {
  const [cardsAdminData, setCardsAdminData] = useState<CardCounts>(DEFAULT_CARDS);

  const [teamTasksByAgent, setTeamTasksByAgent] = useState<AgentTasks[]>([]);
  const [todayTasksByAgent, setTodayTasksByAgent] = useState<AgentTasks[]>([]);
  const [overdueTasksByAgent, setOverdueTasksByAgent] = useState<AgentTasks[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  // Separate accordion states so sections don't fight each other
  const [activeTodayAgent, setActiveTodayAgent] = useState<string | null>(null);
  const [activeOverdueAgent, setActiveOverdueAgent] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setIsError(null);

    const controller = new AbortController();

    try {
      const response = await AxiosProvider.post<AdminDashResponse>(
        "/leads/admin/dashboard",
        {},
        { signal: controller.signal }
      );

      if (!mountedRef.current) return;

      const payload = response?.data?.data ?? {};

      // Cards can be at data.cards or data.cards.team_tasks; prefer the latter when present
      const rawCards = (payload.cards?.team_tasks ?? payload.cards ?? {}) as Partial<CardCounts>;
      const safeCards: CardCounts = {
        ...DEFAULT_CARDS,
        ...rawCards,
      };
      setCardsAdminData(safeCards);

      // Tables
      const teamTasks = payload.tables?.team_tasks_by_agent ?? [];
      setTeamTasksByAgent(teamTasks);

      // Lists
      const todayTasks = payload.lists?.today_tasks_by_agent ?? [];
      setTodayTasksByAgent(todayTasks);

      const overdueTasks = payload.lists?.overdue_tasks_by_agent ?? [];
      setOverdueTasksByAgent(overdueTasks);
    } catch (err: any) {
      if (err?.name !== "CanceledError" && err?.message !== "canceled") {
        setIsError(err?.message || "Failed to load dashboard");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchAdminData();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLead = (id: string | number) => {
    const url = `/leadsdetails?id=${encodeURIComponent(String(id))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const cards = useMemo(
    () => [
      {
        label: "Total Task Today",
        value: cardsAdminData.total_today,
        box: "bg-primary-600",
        iconBox: "bg-primary-600",
        iconPath: "M19 3l-7 7-7-7",
      },
      {
        label: "Task Done Today",
        value: cardsAdminData.done_today,
        box: "bg-primary-600",
        iconBox: "bg-primary-600",
        iconPath: "M5 13l4 4L19 7",
      },
      {
        label: "All Overdue Task",
        value: cardsAdminData.overdue_all,
        box: "bg-primary-600",
        iconBox: "bg-primary-600",
        iconPath: "M12 8v4m0 4h.01M4.22 4.22l15.56 15.56",
      },
      {
        label: "Pending Task Today",
        value: cardsAdminData.pending_today,
        box: "bg-primary-600",
        iconBox: "bg-primart-600",
        iconPath: "M12 8v4m0 4h.01M4.22 4.22l15.56 15.56",
      },
    ],
    [cardsAdminData]
  );

  if (isLoading) return <div className="p-4 text-white">Loading...</div>;
  if (isError) return <div className="p-4 text-red-400">Error: {isError}</div>;

  return (
    <div className="container my-4 text-white ">
      <h3 className="text-2xl font-semibold mb-4">Admin Dashboard</h3>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {cards.map((c, i) => (
          <div key={i} className={`${c.box} p-4 rounded-lg shadow-md flex items-center justify-between`}>
            <div>
              <h3 className="text-lg font-semibold">{c.label}</h3>
              <p className="text-2xl font-bold text-white">{c.value}</p>
            </div>
            <div className={`${c.iconBox} p-3 rounded-full`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white relative top-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={c.iconPath} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Team Tasks by Agent */}
      <div className="mt-8">
        <h4 className="text-xl font-semibold">Team Tasks by Agent</h4>
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full table-auto text-white">
            <thead>
              <tr className="talbleheaderBg">
                <th className="border-b px-4 py-2 text-left">Agent Name</th>
                <th className="border-b px-4 py-2 text-left">Total Today</th>
                <th className="border-b px-4 py-2 text-left">Pending Today</th>
                <th className="border-b px-4 py-2 text-left">Done Today</th>
                <th className="border-b px-4 py-2 text-left">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {teamTasksByAgent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-gray-400">
                    No data available.
                  </td>
                </tr>
              )}
              {teamTasksByAgent.map((agent) => (
                <tr key={agent.agent_id} className="hover:bg-primary-600 odd:bg-[#404040]">
                  <td className="border-b px-4 py-2">{agent.agent_name}</td>
                  <td className="border-b px-4 py-2">{agent.total_today ?? 0}</td>
                  <td className="border-b px-4 py-2">{agent.pending_today ?? 0}</td>
                  <td className="border-b px-4 py-2">{agent.done_today ?? 0}</td>
                  <td className="border-b px-4 py-2">{agent.overdue ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today Tasks by Agent */}
      <div className="mt-6">
        <h4 className="text-xl font-semibold text-white">Today Tasks by Agent</h4>
        <div className="mt-4">
          {todayTasksByAgent.length === 0 && (
            <div className="text-gray-400">No tasks for today.</div>
          )}
          {todayTasksByAgent.map((agent) => {
            const isOpen = activeTodayAgent === agent.agent_id;
            const tasks = agent.tasks ?? [];
            return (
              <div key={`today-${agent.agent_id}`} className="mb-3 overflow-hidden rounded-lg border border-gray-700">
                <button
                  className="w-full flex justify-between items-center talbleheaderBg hover:bg-primary-600 px-4 py-3 text-left text-white font-medium"
                  onClick={() => setActiveTodayAgent(isOpen ? null : agent.agent_id)}
                >
                  <span>{agent.agent_name}</span>
                  <span className="text-xl">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className=" p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-white">
                        <thead>
                          <tr className="talbleheaderBg text-left">
                            <th className="px-4 py-2 border-b border-gray-700">Lead Name</th>
                            <th className="px-4 py-2 border-b border-gray-700">Status</th>
                            <th className="px-4 py-2 border-b border-gray-700">Due Date</th>
                            <th className="px-4 py-2 border-b border-gray-700">Start Time</th>
                            <th className="px-4 py-2 border-b border-gray-700">End Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-3 text-gray-400">
                                No tasks.
                              </td>
                            </tr>
                          )}
                          {tasks.map((task, idx) => (
                            <tr key={`${agent.agent_id}-today-${task.lead_id}-${idx}`} className="hover:bg-primary-700 transition-colors duration-150 odd:bg-[#404040]">
                              <td
                                onClick={() => openLead(task.lead_id)}
                                className="px-4 py-2 border-b border-gray-800 text-primary-600 underline  cursor-pointer rounded-l"
                                title="Open lead in new tab"
                              >
                                {task.lead_name}
                              </td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.status ?? "-"}</td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.due_date ?? "-"}</td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.start_at_ca ?? "-"}</td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.end_at_ca ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue Tasks by Agent */}
      <div className="mt-6">
        <h4 className="text-xl font-semibold text-white">Overdue Tasks by Agent</h4>
        <div className="mt-4">
          {overdueTasksByAgent.length === 0 && (
            <div className="text-gray-400">No overdue tasks 🎉</div>
          )}
          {overdueTasksByAgent.map((agent) => {
            const isOpen = activeOverdueAgent === agent.agent_id;
            const tasks = agent.tasks ?? [];
            return (
              <div key={`overdue-${agent.agent_id}`} className="mb-3 overflow-hidden rounded-lg border border-gray-700">
                <button
                  className="w-full flex justify-between items-center talbleheaderBg hover:bg-primary-500 px-4 py-3 text-left text-white font-medium"
                  onClick={() => setActiveOverdueAgent(isOpen ? null : agent.agent_id)}
                >
                  <span>{agent.agent_name}</span>
                  <span className="text-xl">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="   p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-white">
                        <thead>
                          <tr className="talbleheaderBg text-left">
                            <th className="px-4 py-2 border-b border-gray-700">Lead Name</th>
                            <th className="px-4 py-2 border-b border-gray-700">Status</th>
                            <th className="px-4 py-2 border-b border-gray-700">Due Date</th>
                            <th className="px-4 py-2 border-b border-gray-700">Start Time</th>
                            <th className="px-4 py-2 border-b border-gray-700">End Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-3 text-gray-400">
                                No tasks.
                              </td>
                            </tr>
                          )}
                          {tasks.map((task, idx) => (
                            <tr key={`${agent.agent_id}-overdue-${task.lead_id}-${idx}`} className="hover:bg-primary-700 transition-colors duration-150 odd:bg-[#404040]">
                              <td
                                onClick={() => openLead(task.lead_id)}
                                className="px-4 py-2 border-b border-gray-800 text-primary-600 underline  cursor-pointer rounded-l"
                                title="Open lead in new tab"
                              >
                                {task.lead_name}
                              </td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.status ?? "-"}</td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.due_date ?? "-"}</td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.start_at_ca ?? "-"}</td>
                              <td className="px-4 py-2 border-b border-gray-800">{task.end_at_ca ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
