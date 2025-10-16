"use client";
import Image from "next/image";
import Tabs from "../component/Tabs";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { PiArrowCircleUp } from "react-icons/pi";
import LeftSideBar from "../component/LeftSideBar";
import AxiosProvider from "../../provider/AxiosProvider";
import { useEffect, useState } from "react";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { MdOutlineSecurity } from "react-icons/md";
import { MdOutlineRuleFolder } from "react-icons/md";
import Link from "next/link";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";

export default function Home() {
  const checking = useAuthRedirect();
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
    <div className=" flex justify-end  min-h-screen">
      {/* Main content right section */}
      <LeftSideBar />
      <div className="ml-[97px] w-full md:w-[90%] m-auto  min-h-[500px]  rounded p-4 mt-0 ">
        {/* left section top row */}
        <DesktopHeader />
        {/* right section top row */}
        {/* </div> */}
        <div className="w-full  flex justify-center p-0 md:p-0 mt-6 md:mt-0">
          <div className="w-full min-h-80 md:min-h-[600px]  rounded-3xl  z-10 mainContainerBg">
            <div className="p-3 md:p-6  flex w-full">
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <Link
                  href="/"
                  target="_blank"
                  className="shadow-dashboardShadow p-8 rounded w-full md:w-2/6  flex items-center gap-2 bg-gradient-to-b from-primary-200 to-primary-100 hover:from-primary-300 hover:to-primary-200 active:from-primary-400 active:to-primary-300"
                >
                  <MdOutlineSecurity className=" text-primary-600 text-2xl" />
                  <p className="text-firstBlack text-xl font-medium">
                    Terms and conditions
                  </p>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="shadow-dashboardShadow p-8 rounded w-full md:w-2/6 flex items-center gap-2 bg-gradient-to-b from-primary-200 to-primary-100 hover:from-primary-300 hover:to-primary-200 active:from-primary-400 active:to-primary-300"
                >
                  <MdOutlineRuleFolder className=" text-primary-600 text-2xl" />
                  <p className="text-firstBlack text-xl font-medium">
                    Privacy policy
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
