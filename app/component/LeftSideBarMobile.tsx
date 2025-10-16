"use client";
import Link from "next/link";
import Image from "next/image";
import { IoMdSettings } from "react-icons/io";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RiFileAddLine, RiHistoryLine } from "react-icons/ri";
import { FaUserEdit } from "react-icons/fa";
import { MdOutlineDashboard, MdOutlinePeopleOutline } from "react-icons/md";
import StorageManager from "../../provider/StorageManager";
import AxiosProvider from "../../provider/AxiosProvider";

const axiosProvider = new AxiosProvider();
const storage = new StorageManager();

const LeftSideBarMobile: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // Mobile menu toggle
  const pathname = usePathname();
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
    <div className="w-full flex flex-col justify-between py-2 px-2 mt-2 md:hidden">
      {/* Logo */}
      <Link href="/dashboard" className="flex gap-2 mb-8 px-3 py-2">
        <Image
          src="/images/crmlogo.jpg"
          alt="Orizon Logo"
          width={0}
          height={0}
          className="w-11 h-auto"
        />
        <p className="text-[25px] font-bold uppercase text-primary-600">
          Orizon
        </p>
      </Link>

      {/* Navigation */}
      <nav>
        <SidebarItem
          href="/dashboard"
          label="Dashboard"
          icon={<MdOutlineDashboard />}
          pathname={pathname}
        />
        <SidebarItem
          href="/leads"
          label="Leads"
          icon={<RiFileAddLine />}
          pathname={pathname}
        />

        {/* Conditionally render links for Admin */}
        {userRole === "Admin" && (
          <>
            <SidebarItem
              href="/usermanagement"
              label="User Management"
              icon={<FaUserEdit />}
              pathname={pathname}
            />
            <SidebarItem
              href="/user-activity"
              label="User Activity"
              icon={<RiHistoryLine />}
              pathname={pathname}
            />
            <SidebarItem
              href="/setting"
              label="Setting"
              icon={<IoMdSettings />}
              pathname={pathname}
            />
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="flex gap-2 items-center px-3 mt-6 cursor-pointer" onClick={handleLogout}>
        <Image
          src="/images/logoutIcon.svg"
          alt="logout Icon"
          width={24}
          height={24}
        />
        <button className="text-base font-semibold text-[#EB5757]">Logout</button>
      </div>
    </div>
  );
};

// SidebarItem Component
const SidebarItem = ({
  href,
  label,
  icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  pathname: string;
}) => {
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-4 px-3 py-3 rounded-[4px] ${
          isActive
            ? "bg-primary-600 text-white"
            : "text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600"
        }`}
      >
        <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
        <p className="text-base font-medium leading-none">{label}</p>
      </div>
    </Link>
  );
};

export default LeftSideBarMobile;
