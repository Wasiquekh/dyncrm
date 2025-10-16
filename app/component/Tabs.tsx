"use client";

import { useState } from "react";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <button
    className={`py-2 px-4 text-base font-medium transition-colors duration-200  w-full md:w-auto text-left md:text-center border-b-[3px] md:border-l-0 md:border-b-[3px] border-transparent hover:text-primary-600 hover:!border-primary-600 active:text-primary-700 active:!border-primary-700 ${
      isActive
        ? "text-primary-500 border-b-[3px] md:border-l-0 md:border-b-[3px] !border-primary-500"
        : "text-white"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

interface TabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, isActive }) => (
  <div className={`py-3 ${isActive ? "block" : "hidden"}`}>{children}</div>
);

interface TabsProps {
  tabs: {
    label: string;
    content: React.ReactNode;
  }[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].label);

  return (
    <div className="w-full">
      <div className="flex border-b-[2px] border-[#F4F5F7]  overflow-x-auto md:overflow-visible">
        <div className="flex flex-row md:flex-row md:space-x-4 whitespace-nowrap">
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
              label={tab.label}
              isActive={tab.label === activeTab}
              onClick={() => setActiveTab(tab.label)}
            />
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tabs.map((tab) => (
          <TabPanel key={tab.label} isActive={tab.label === activeTab}>
            {tab.content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
