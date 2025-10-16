"use client";
import Link from "next/link";
import Image from "next/image";
import { IoMdLogOut, IoMdSettings } from "react-icons/io";
import { usePathname } from "next/navigation";
import AxiosProvider from "../../provider/AxiosProvider";
import { useState } from "react";
import { RiFileAddLine, RiHistoryLine } from "react-icons/ri";
import { FaUserEdit } from "react-icons/fa";
import { MdOutlineDashboard, MdOutlinePeopleOutline } from "react-icons/md";
import { storage } from "firebase-admin";
import StorageManager from "../../provider/StorageManager";
import { HiTemplate } from "react-icons/hi";

const axiosProvider = new AxiosProvider();

const LeftSideBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const pathname = usePathname();
  const storage = new StorageManager();
  const userRole = storage.getUserRole();

  const handleLogout = async () => {
    try {
      await AxiosProvider.post("/logout", {});
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`hidden  md:flex flex-col justify-between py-4 px-1 border-r-2 border-customBorder shadow-borderShadow mt-0 h-screen fixed top-0 left-0 transition-all duration-200 ease-in-out overflow-hidden text-white z-[1000] bg-[#232323] ${
        isExpanded ? "w-72" : "w-[57px]"
      }`}
    >
      {/* SIDE LEFT BAR TOP SECTION */}
      <div className="z-50 custom-scrollbar">
        <Link href="/dashboard">
          <div className="flex items-center gap-4 mb-12 px-3 py-2">
            {/* Fixed-size icon box to prevent shift */}
            <div className="relative h-6 w-6 shrink-0 ">
              <Image
                src="/images/crmlogo.jpg"
                alt="Orizon icon"
                fill
                className="object-contain"
              />
            </div>

            {isExpanded && (
              <p className="text-xl leading-none font-bold uppercase text-white whitespace-nowrap">
                Lead CRM
              </p>
            )}
          </div>
        </Link>

        {/* MENU WITH ICONS */}
        <Link href="/dashboard">
          <div
            className={`mb-4 flex items-center gap-4 group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-white hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed   ${
              pathname === "/dashboard"
                ? "bg-primary-600 text-white  hover:!text-white"
                : ""
            }`}
          >
            <div className="h-6 w-6 shrink-0 grid place-items-center">
              <MdOutlineDashboard className="h-5 w-5" />
            </div>
            {isExpanded && (
              <p className="whitespace-nowrap leading-none">Dashboard</p>
            )}
          </div>
        </Link>
        {userRole === "Admin" && (
          <Link href="/leads">
            <div
              className={`mb-4 flex items-center gap-4 group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-white hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed   ${
                pathname === "/leads" || pathname === "/leadsdetails"
                  ? "bg-primary-600 text-white  hover:!text-white"
                  : ""
              }`}
            >
              <div className="h-6 w-6 shrink-0 grid place-items-center">
                <RiFileAddLine className="h-5 w-5" />
              </div>
              {isExpanded && (
                <p className="whitespace-nowrap leading-none">Leads</p>
              )}
            </div>
          </Link>
        )}

        {userRole === "Admin" && (
          <Link href="/usermanagement">
            <div
              className={`mb-4 flex items-center gap-4 group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-white hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed   ${
                pathname === "/usermanagement" || pathname === "/useradd"
                  ? "bg-primary-600 text-white  hover:!text-white"
                  : ""
              }`}
            >
              <div className="h-6 w-6 shrink-0 grid place-items-center">
                <FaUserEdit className="h-5 w-5" />
              </div>
              {isExpanded && (
                <p className="whitespace-nowrap leading-none">
                  User Management
                </p>
              )}
            </div>
          </Link>
        )}
        {userRole === "Admin" && (
          <Link href="/template">
            <div
              className={`mb-4 flex items-center gap-4 group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-white hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed   ${
                pathname === "/template"
                  ? "bg-primary-600 text-white  hover:!text-white"
                  : ""
              }`}
            >
              <div className="h-6 w-6 shrink-0 grid place-items-center">
                <HiTemplate className="h-5 w-5" />
              </div>
              {isExpanded && (
                <p className="whitespace-nowrap leading-none">
                  Template Management
                </p>
              )}
            </div>
          </Link>
        )}
        {userRole === "Admin" && (
          <Link href="/user-activity">
            <div
              className={`mb-4 flex items-center gap-4 group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-white hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed   ${
                pathname === "/user-activity"
                  ? "bg-primary-600 text-white  hover:!text-white"
                  : ""
              }`}
            >
              <div className="h-6 w-6 shrink-0 grid place-items-center">
                <RiHistoryLine className="h-5 w-5" />
              </div>
              {isExpanded && (
                <p className="whitespace-nowrap leading-none">User Activity</p>
              )}
            </div>
          </Link>
        )}
        {userRole === "Admin" && (
          <Link href="/setting">
            <div
              className={`mb-4 flex items-center gap-4 group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-white hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed   ${
                pathname === "/setting"
                  ? "bg-primary-600 text-white  hover:!text-white"
                  : ""
              }`}
            >
              <div className="h-6 w-6 shrink-0 grid place-items-center">
                <IoMdSettings className="h-5 w-5" />
              </div>
              {isExpanded && (
                <p className="whitespace-nowrap leading-none">Setting</p>
              )}
            </div>
          </Link>
        )}
      </div>
      {/* END SIDE LEFT BAR TOP SECTION */}

      {/* SIDE LEFT BAR BOTTOM SECTION */}
      <div
        onClick={handleLogout}
        className="flex items-center gap-4 px-3 py-2 z-10 cursor-pointer"
      >
        <div className="">
          {/* <Image
            src="/images/logoutIcon.svg"
            alt="Logout icon"
            fill
            className="object-contain"
          /> */}
          <IoMdLogOut className="" />
        </div>
        {isExpanded && (
          <span className="text-base font-semibold leading-none text-white whitespace-nowrap">
            Logout
          </span>
        )}
      </div>
      {/* END SIDE LEFT BAR BOTTOM SECTION */}

      {/* Decorative sidebar background (non-interactive) */}
      {/* <Image
        src="/images/sideBarDesign.svg"
        alt="sidebar design"
        width={100}
        height={100}
        className="pointer-events-none select-none w-full absolute bottom-0 right-0 -mb-24"
      /> */}
    </div>
  );
};

export default LeftSideBar;
