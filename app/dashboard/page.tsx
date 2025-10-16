"use client";
import Image from "next/image";
import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import AxiosProvider from "../../provider/AxiosProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import StorageManager from "../../provider/StorageManager";
import React from "react";
import AdminDashboard from "../component/AdminDashboard";
import {
  MdOutlineDriveFolderUpload,
  MdOutlineLocationCity,
  MdOutlinePhone,
} from "react-icons/md";
import { FaSearchPlus } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import CreateLead from "../component/CreateLead";
import { IoCloseOutline, IoMailOpenOutline } from "react-icons/io5";
import SearchLead from "../component/SearchLead";
import { FaEllipsisVertical } from "react-icons/fa6";
import { ImUserTie } from "react-icons/im";
import { RxAvatar } from "react-icons/rx";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";
import { toast } from "react-toastify";

export interface AgentStats {
  agent_id: string; // Unique identifier for the agent (UUID)
  agent_name: string; // Name of the agent
  done_today: number; // Number of tasks completed today
  overdue: number; // Number of overdue tasks
  pending_today: number; // Number of tasks still pending today
  total_today: number; // Total tasks assigned for today
}
export interface CardsData {
  overdue: number;
  today: {
    cancelled: number;
    done: number;
    pending: number;
    today_ca: string;
    total: number;
  };
  upcoming: number;
}
export interface TodayTaskList {
  id: string;
  lead_id: string;
  lead_name: string;
  start_at: string; // ISO date string e.g. "2025-09-25T18:15:00.000Z"
  start_at_est: string; // formatted datetime e.g. "09-25-2025 02:15 PM"
  start_date_est: string; // formatted date e.g. "09-25-2025"
  status: string; // e.g. "pending", "completed", ...
  subject: string; // e.g. "phonecall: bhotu12"
  type: string; // e.g. "followup"
}
export interface UpcomingTaskList {
  id: string;
  lead_id: string;
  lead_name: string;
  start_at: string; // ISO date string e.g. "2025-09-25T18:15:00.000Z"
  start_at_est: string; // formatted datetime e.g. "09-25-2025 02:15 PM"
  start_date_est: string; // formatted date e.g. "09-25-2025"
  status: string; // e.g. "pending", "completed"
  subject: string; // e.g. "phonecall: bhotu12"
  type: string; // e.g. "followup"
}
export interface OverdueTask {
  id: string;
  lead_id: string;
  lead_name: string;
  start_at: string; // UTC ISO date string
  start_at_est: string; // formatted date-time
  start_date_est: string; // formatted date
  status: string;
  subject: string;
  type: string;
}

const storage = new StorageManager();
const userRole = storage.getUserRole();
export default function Home() {
  const checking = useAuthRedirect();

  // -------------FOR AGENT-----------
  const [cards, setCards] = useState<CardsData | null>(null);
  const [todayTasksListData, setTodayTasksListData] = useState<TodayTaskList[]>(
    []
  );
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTaskList[]>([]);
  const [overdueTaskData, setOverDueTaskData] = useState<OverdueTask[]>([]);
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [isCreateLead, setIsCreateLead] = useState<boolean>(false);
  const [isSeachLead, setIsSearchLead] = useState<boolean>(false);
  const [searcheddata, setIsSearchData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  // NEW: remember the last applied filters from SearchLead
  const [lastFilters, setLastFilters] = useState<Record<string, any> | null>(
    null
  );
  console.log("BBBBBBBBBBBBBBBBBBBBBBBBB", page);

  // -------------END FOR AGENT-----------
  const [isError, setIsError] = useState<boolean>(false);

  // USE EFFECT AGENT
  const fetchAgentData = async () => {
    try {
      const response = await AxiosProvider.post("/leads/task/agent/dashboard");
      setCards(response.data.data.cards);
      setTodayTasksListData(response.data.data.lists.pending_today);
      setUpcomingTasks(response.data.data.lists.upcoming);
      setOverDueTaskData(response.data.data.lists.overdue);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const test = (lead_id: string) => {
    window.open(`/leadsdetails?id=${lead_id}`, "_blank"); // "_blank" = new tab
  };
  const createLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLead(true);
  };
  const filterLeads = () => {
    setFlyoutOpen(true);
    setIsSearchLead(true);
  };
  const closeFlyOut = () => {
    setFlyoutOpen(false);
    setIsCreateLead(false);
    setIsSearchLead(false);
  };
  // Add a 3rd param to control toasting on demand
  const fetchSearchedLeads = async (
    filters: Record<string, any>,
    pageNo: number,
    opts: { showToast?: boolean } = {}
  ) => {
    const { showToast = false } = opts;

    try {
      const res = await AxiosProvider.post(
        `/leads/filter?page=${pageNo}`,
        filters
      );
      const list = res.data?.data?.data ?? [];
      const totalPages = res?.data?.data?.pagination?.totalPages ?? 1;

      if (list.length === 0) {
        if (showToast) toast.info("No data found");
        setIsSearchData([]); // keep state consistent
        setTotalPage(totalPages); // still set total pages (usually 1)
        return; // stop here
      }

      setIsSearchData(list);
      setTotalPage(totalPages);
    } catch (e) {
      console.error("Search fetch failed:", e);
    }
  };

  useEffect(() => {
    if (lastFilters) {
      // Don't show toast when just changing pages
      fetchSearchedLeads(lastFilters, page, { showToast: false });
    }
  }, [page, lastFilters]);

  const handlePagination = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPage) {
      setPage(newPage);
    }
  };
  if (checking) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center bg-white">
        <Image
          src="/images/crmlogo.jpg"
          alt="Loading"
          width={150}
          height={150}
          className="animate-pulse rounded"
        />
      </div>
    );
  }
  return (
    <>
      <div className=" text-white">
        {/* Left sidebar */}
        <LeftSideBar />

        {/* Main content right section */}
        <div className="ml-[97px] w-full md:w-[90%] m-auto p-4 mt-0">
          {/* Right section top row */}
          <DesktopHeader />
          {userRole === "Agent" && (
            <div className=" flex justify-end items-center gap-4">
              <div
                className=" flex justify-center gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-800 group"
                onClick={() => createLeads()}
              >
                <FiPlusCircle className=" w-5 h-5 text-white group-hover:text-white" />
                <p className=" text-white text-base font-medium group-hover:text-white">
                  Create Leads
                </p>
              </div>

              <div
                className=" flex justify-center  gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-800 group"
                onClick={() => filterLeads()}
              >
                <FaSearchPlus className=" w-5 h-5 text-white group-hover:text-white" />
                <p className=" text-white text-base font-medium group-hover:text-white">
                  Search Leads
                </p>
              </div>
            </div>
          )}

          {/* SEARED DATA */}
          {/* -------------SEARCHED TABLE---------------- */}
          {searcheddata?.length > 0 && !isError ? (
            <>
              <table className="w-full text-sm text-left text-white  mt-6">
                <thead className="text-xs text-[#999999] talbleheaderBg">
                  <tr className="border border-tableBorder">
                    {/* Full Name */}
                    <th
                      scope="col"
                      className="px-3 py-3 md:p-3 border border-tableBorder"
                    >
                      <div className="flex items-center gap-2">
                        <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Full Name
                        </span>
                      </div>
                    </th>

                    {/* Email */}
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <IoMailOpenOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Email
                        </span>
                      </div>
                    </th>

                    {/* Phone */}
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <MdOutlinePhone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Phone
                        </span>
                      </div>
                    </th>

                    {/* Address */}
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <MdOutlineLocationCity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Address
                        </span>
                      </div>
                    </th>

                    {/* Agent */}
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <ImUserTie className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Agent
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {searcheddata.map((item: any, index: number) => (
                    <tr
                      key={item?.id ?? index}
                      className="border border-tableBorder  hover:bg-primary-700 odd:bg-[#404040]"
                    >
                      {/* Full name */}
                      <td
                        onClick={() => test(item?.id)}
                        className="px-1 py-2 md:px-3 md:py-2 border-tableBorder flex items-center gap-2 text-primary-600 underline cursor-pointer"
                      >
                        <p className=" text-sm sm:text-base font-medium leading-normal capitalize">
                          {item?.full_name ?? "-"}
                        </p>
                      </td>

                      {/* Email */}
                      <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                        <span className="text-white text-sm sm:text-base">
                          {item?.email ?? "-"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                        <span className="text-white text-sm sm:text-base">
                          {item?.phone ?? "-"}
                        </span>
                      </td>

                      {/* Address (country) */}
                      <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                        <span className="text-white text-sm sm:text-base capitalize">
                          {item?.address?.country ?? "-"}
                        </span>
                      </td>

                      {/* Agent */}
                      <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                        <span className="text-white text-sm sm:text-base capitalize">
                          {item?.agent?.name ?? "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center items-center my-10 relative">
                <button
                  onClick={() => handlePagination(page - 1)}
                  disabled={page === 1}
                  className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiChevronDoubleLeft className="w-6 h-auto" />
                </button>
                <span className="text-white text-sm">
                  Page {page} of {totalPage}
                </span>
                <button
                  onClick={() => handlePagination(page + 1)}
                  disabled={page === totalPage}
                  className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiChevronDoubleRight className="w-6 h-auto" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-xl mt-5 text-white"></div>
          )}

          {/* -------------END SEARCHED TABLE---------------- */}

          {/* DASHBOARD CONTENT */}
          {userRole === "Agent" && (
            <>
              <div className="w-full mt-12">
                <div className="grid grid-cols-3 gap-6">
                  {/* Tab 1 */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-primary-600 text-white shadow-md">
                    <p className="text-sm font-medium opacity-80">
                      Task for Today
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {cards?.today.total ?? 0}
                    </p>
                  </div>

                  {/* Tab 3 */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-primary-600 text-white shadow-md">
                    <p className="text-sm font-medium opacity-80">
                      Overdue All
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {cards?.overdue ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* TABLE TASK FOR TODAY */}
              <h1 className="mt-5">Table Task for Today</h1>
              <div className="overflow-x-auto rounded-lg shadow  mt-2">
                <table className="min-w-full text-sm text-left">
                  <thead className="talbleheaderBg font-semibold">
                    <tr>
                      <th className="p-3">Lead Name</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Start At</th>
                      <th className="p-3">Start Date</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {todayTasksListData.length > 0 ? (
                      todayTasksListData.map((task) => (
                        <tr
                          key={task.id}
                          className="border-t odd:bg-[#404040] hover:bg-primary-700"
                        >
                          <td
                            onClick={() => test(task.lead_id)}
                            className="p-3 cursor-pointer"
                          >
                            <p className="text-primary-600 underline font-medium ">
                              {task.lead_name}
                            </p>
                          </td>
                          <td className="p-3">{task.subject}</td>
                          <td className="p-3 capitalize">{task.type}</td>
                          <td className="p-3 capitalize">{task.status}</td>
                          <td className="p-3">{task.start_at_est}</td>
                          <td className="p-3">{task.start_date_est}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-center text-white" colSpan={6}>
                          No tasks for today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOR OVERDUE TASK */}
              <h1 className="mt-5">Table Overdue Task</h1>
              <div className="overflow-x-auto rounded-lg shadow  mt-6">
                <table className="min-w-full text-sm text-left">
                  <thead className="talbleheaderBg font-semibold">
                    <tr>
                      <th className="p-3">Lead Name</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Start At</th>
                      <th className="p-3">Start Date</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {overdueTaskData.length > 0 ? (
                      overdueTaskData.map((task) => (
                        <tr
                          key={task.id}
                          className="border-t hover:bg-primary-700 odd:bg-[#404040]"
                        >
                          <td
                            onClick={() => test(task.lead_id)}
                            className="p-3 cursor-pointer text-primary-600 underline"
                          >
                            <p className="   font-medium">{task.lead_name}</p>
                          </td>
                          <td className="p-3">{task.subject}</td>
                          <td className="p-3 capitalize">{task.type}</td>
                          <td className="p-3 capitalize">{task.status}</td>
                          <td className="p-3">{task.start_at_est}</td>
                          <td className="p-3">{task.start_date_est}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-center text-white" colSpan={6}>
                          No overdue tasks
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ADMIN CODE */}
          {userRole === "Admin" && <AdminDashboard />}
        </div>
      </div>

      <div className="absolute bottom-0 right-0">
        <Image
          src="/images/sideDesign.svg"
          alt="side design"
          width={100}
          height={100}
          className="w-full h-full -z-10 hidden"
        />
      </div>

      {/* FLYOUT IS START */}
      {isFlyoutOpen && (
        <div
          className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => {
            closeFlyOut();
          }}
        ></div>
      )}

      <div className={`flyout ${isFlyoutOpen ? "open" : ""}`}>
        {isCreateLead && (
          <div className="w-full min-h-auto p-4  text-white">
            {/* Flyout header */}
            <div className="flex justify-between mb-4">
              <p className="text-primary-500 text-2xl font-bold leading-9">
                Create Leads
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            <CreateLead closeFlyOut={closeFlyOut} />
          </div>
        )}
        {isSeachLead && (
          <div className="w-full min-h-auto p-4  text-white">
            {/* Flyout header */}
            <div className="flex justify-between mb-4">
              <p className="text-primary-500 text-2xl font-bold leading-9">
                Search Leads
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            <SearchLead
              setSearchedData={setIsSearchData}
              closeFlyOut={closeFlyOut}
              setPage={setPage}
              setTotalPage={setTotalPage}
              page={page}
              onApplyFilters={(payload) => {
                setLastFilters(payload); // remember filters
                setPage(1); // start from first page
                fetchSearchedLeads(payload, 1, { showToast: true }); // 👈 toast if empty
              }}
            />
          </div>
        )}
      </div>

      {/* end flyout */}
    </>
  );
}
