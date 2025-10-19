"use client";
import Image from "next/image";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import {
  IoIosCloseCircleOutline,
  IoIosNotificationsOutline,
} from "react-icons/io";
import { FaCalendarCheck, FaGreaterThan } from "react-icons/fa6";
import { FiFilter, FiPlusCircle } from "react-icons/fi";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { MdEdit, MdOutlineCall, MdOutlineDriveFolderUpload, MdOutlineLocationCity, MdOutlinePhone, MdOutlineSettings } from "react-icons/md";
import { LiaArrowCircleDownSolid } from "react-icons/lia";
import { MdRemoveRedEye } from "react-icons/md";
import { IoCloseOutline, IoMailOpenOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import AxiosProvider from "../../provider/AxiosProvider";
import { RiAccountCircleLine, RiDeleteBin6Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import StorageManager from "../../provider/StorageManager";
import { AppContext } from "../AppContext";
//import CustomerViewDetails from "../component/CustomerViewDetails";
import LeftSideBar from "../component/LeftSideBar";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DesktopHeader from "../component/DesktopHeader";
import { FaEllipsisVertical } from "react-icons/fa6";
import { strict } from "assert";
import { Tooltip } from "react-tooltip";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";
import Tabs from "../component/Tabs";
import page from "../page";
import { BiUserPin } from "react-icons/bi";
import { FaRegCheckCircle, FaSearchPlus } from "react-icons/fa";
import { ImUserTie } from "react-icons/im";

const axiosProvider = new AxiosProvider();

interface FilterData {
  name: string;
  mobilephonenumber?: string;
  birthdate?: string;
}

// ALL LEADS
interface Lead {
  id: string;
  lead_number: string;
  owner_name: string | null;
  account_manager: string | null;
  best_time_to_call: string | null;

  lead_source: string | null;
  debt_consolidation_status: string | null;
  consolidated_credit_status: string | null;
  whatsapp_status: string | null;
  loan_application_status: string | null;

  full_name: string;
  email: string | null;
  phone: string | null;

  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  };

  lead_score: number | null;
  lead_quality: string | null;

  agent: {
    id: string;
    name: string;
  } | null;

  created_at: string;
  updated_at: string;

  lead_age_days: number;
  lead_age_label: string;
}
//CREATE LEADS
type CreateLead = {
  id: string;
  full_name?: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  lead_score?: number;
  lead_quality?: string;
  best_time_to_call?: string;
  lead_source_id: string;
  debt_consolidation_status_id: string;
  whatsapp_number: string;
  consolidated_credit_status_id?: string;
};
export interface LeadSource {
  id: string;
  name: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
export interface Consolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
export interface DebtConsolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
type FilterValues = {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  lead_number: string;
  city: string;
  state: string;
  agent_id: string;
  lead_source_id: string;
  debt_consolidation_status_id: string;
  consolidated_credit_status_id: string;
};
type LeadSourceOption = { id: string | number; name: string };
    type FilterFormValues = {
      full_name: string;
      email: string;
      phone: string;
      lead_number: string;
      city: string;
      state: string;
      agent_ids: string[];
      lead_source_id: string;
      debt_consolidation_status_id: string;
      consolidated_credit_status_id: string;
    };
export default function Home() {
   const checking = useAuthRedirect();
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [notAssignData, setNotAssignData] = useState<Lead[]>([]);
  console.log("NOT ASSIGN DATAAAAAAAAA",notAssignData)
 const [assignLeadData, setAssignLeadData] = useState<Lead[]>([]);
 //console.log(" ASSIGN DATAAAAAAAAA",assignLeadData)
  //console.log("DATAAAAA", data);
  // PAGINATION USE STATES
    const [globalPageSize] = useState<number>(10)
    const [unAssignPage, setUnAssignPage] = useState<number>(1);
    const [unAssignTotalPages, setUsAssignTotalPages] = useState<number>(1)

    const [assignPage, setAssignPage] = useState<number>(1);
    const [assignTotalPages, setassignTotalPages] = useState<number>(1)

    const [UnAssignPageFilter, setUnAssignPageFilter] = useState<number>(1);
    const [UnAssignTotalPagesFilter, setUnAssignTotalPagesFilter] = useState<number>(1)

    const [assignPageFilter, setAssignPageFilter] = useState<number>(1);
    const [assignTotalPagesFilter, setAssignTotalPagesFilter] = useState<number>(1)

    const [unAssignFilterPagination, setUnAssignFilterPagination] = useState<boolean>(false)
    const [assignFilterPagination, setAssignFilterPagination] = useState<boolean>(false)

    // END PAGINATION USE STATES

  const [filterPage, setFilterPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPagesFilter, setTotalPagesFilter] = useState<number>(1);
  const [filterData, setFilterData] = useState<FilterData>({
    name: "",
    mobilephonenumber: "",
  });
  //console.log("TTTTTTTTTTTTTTTTTTTTTTTT", filterData);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(null);
  const [isCreateLeads, setIsCreateLeads] = useState<boolean>(false);
  const [isBulkLeads, setIsBulkLeads] = useState<boolean>(false);
  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [isEditLead, setIsEditLead] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<Lead | null>(null);
  const [hitApi, setHitApi] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [editLeadData, setEditLeadData] = useState(null);
  console.log("555555555555555555555", editLeadData);
  const [leadSourceData, setLeadSourceData] = useState<LeadSource[]>([]);
  const [consolidationData, setConsolidationData] = useState<Consolidation[]>(
    []
  );
  const [debtConsolidation, setDebtConsolidation] = useState<
    DebtConsolidation[]
  >([]);
  const [isAgent, setIsAgent] = useState<boolean>(false);
  const [isAgentBulkCheckAssign, setIsagentBulkCehckAssign] = useState<boolean>(false)
  const [agentList, setAgentList] = useState<Agent[]>([]);
  //console.log("ALL AGENTS",agentList)
  // 👉 holds the selected agent from dropdown
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  //console.log("DDDAAANISHHHH", agentFetchedData);
  const [currentLeadId, setCurrentLeadId] = useState<string>(null);
  const [leadSourceDisplay, setLeadSourceDisplay] = useState<any>(null);
  const [clearFilter, setClearFilter] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignFilteredData, setAssignFilteredData] = useState({});
  const [unAssignFilteredData, setUnAssignFilteredData] = useState({});
  //console.log("SSSSSSSSSSSSSSSSSSS",assignFilteredData)

const toggleRow = (id: string, checked: boolean) => {
  setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(x => x !== id)));
};

// keep selection clean if the data changes
useEffect(() => {
  if (!notAssignData?.length) {
    setSelectedIds([]);
    return;
  }
  const valid = new Set(notAssignData.map((x: any) => x.id));
  setSelectedIds(prev => prev.filter(id => valid.has(id)));
}, [notAssignData]);

// --- action click ---
   const handleBulkAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) {
      toast.error("Please select an agent");
      return;
    }
    setFlyoutOpen(false);
    //return;
    try {
      await AxiosProvider.post("/leads/assigned/bulk", {
        lead_ids: selectedIds,
        agent_id: selectedAgent.id,
      });
      toast.success("Lead is Updated");
      setHitApi(!hitApi);
      setSelectedAgent(null);
    } catch (error: any) {
      toast.error("Lead is not Updated");
    }
    // console.log("✅ Selected Agent Name:", selectedAgent.name);
    //  console.log("✅ Selected Agent ID:", selectedAgent.id);

    // Example: post to API
    // await AxiosProvider.post("/assign-agent", { agent_id: selectedAgent.id });
  };

  //  console.log("Debt Conolidation", debtConsolidation);
  //console.log("SELECTED DATA", selectedData);
  const storage = new StorageManager();
  const userRole = storage.getUserRole();
  //console.log("user role", userRole);
  const accessToken = storage.getAccessToken();

  //console.log("Get all user Data", data);
  const router = useRouter();

  const handleClick = async (customer: Lead) => {
    // console.log('Object customer data',customer.id)
    router.push(`/leadsdetails?id=${customer.id}`);
  };
// Normalize helpers
const normalizePhone = (s?: string) => (s ?? "").replace(/[\s-]/g, "");

 const LeadSchema = Yup.object({
  full_name: Yup.string().trim().required("Full name is required"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),

  // ✅ Accepts 10-digit Indian numbers with optional +91 / 91; ignores spaces/dashes
  phone: Yup.string()
    .transform((_v, orig) => normalizePhone(orig))
    .required("Phone number is required")
    .matches(
      /^(\+?91)?[6-9]\d{9}$/,
      "Enter a valid phone number (10 digits, optional +91)"
    ),

  // Optional WhatsApp number (same normalization). Remove if you don't use this field.
  whatsapp_number: Yup.string()
    .transform((_v, orig) => normalizePhone(orig))
    .nullable()
    .notRequired()
    .test("whats-valid", "Enter a valid WhatsApp number", (val) => {
      if (!val) return true; // optional
      return /^(\+?91)?[6-9]\d{9}$/.test(val);
    }),

  address_line1: Yup.string().nullable().notRequired(),
  address_line2: Yup.string().nullable().notRequired(),
  city: Yup.string().nullable().notRequired(),
  state: Yup.string().nullable().notRequired(),
  postal_code: Yup.string().nullable().notRequired(),
  country: Yup.string().nullable().notRequired(),

  lead_score: Yup.number()
    .transform((v, o) => (o === "" ? undefined : v))
    .typeError("Lead score must be a number")
    .nullable()
    .notRequired(),

  lead_quality: Yup.string().nullable().notRequired(),
  best_time_to_call: Yup.string().nullable().notRequired(),

  // Dropdowns (store id strings; allow empty)
  lead_source_id: Yup.string().nullable().notRequired(),
  debt_consolidation_status_id: Yup.string().nullable().notRequired(),

  // If you have `status` in the edit/create forms, keep it optional:
  status: Yup.string().nullable().notRequired(),
});

  const handleCreateLead = async (value: any) => {
    //console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",value)
    //return;
    setIsLoading(true);
    // setIsFilter(false);
    setFlyoutOpen(false);
    //console.log("4444444444444444", value);
   // return;

    try {
      await AxiosProvider.post("/leads", value);
      toast.success("Lead is Created");
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error(error.response.data.msg);
    //  console.log("lead create error",error.response.data.msg)
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateLead = async (value: any) => {
   // setIsLoading(true);
    // setIsFilter(false);
    setFlyoutOpen(false);
   // console.log("@@@@@@@@@@@@@", value);
    //return;

    try {
      await AxiosProvider.post("/leads/update", value);
      toast.success("Lead is updated")
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error("Lead is not Updated");
    } 
    // finally {
    //   setIsLoading(false);
    // }
  };
  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!excelFile) return toast.error("Please select a file");
    if (!leadSourceDisplay?.id) {
      return toast.error("Please select a Lead Source");
    }

    // If lead source is mandatory, uncomment:
    // if (!leadSourceDisplay?.id) return toast.error("Please select a Lead Source");

    const formEl = e.currentTarget;

    try {
      setIsLoading(true);
      setFlyoutOpen(false);

      const fd = new FormData();
      fd.append("file", excelFile as File); // key = "file" (as before)
      if (leadSourceDisplay?.id != null) {
        fd.append("lead_source_id", String(leadSourceDisplay.id)); // add lead_source_id
      }
      // console.log("LLLLLLLLLLLLLLLLLLLL", leadSourceDisplay);

      const res = await fetch(
        "https://lead-crm-backend.dynsimulation.com/api/v1/managelead/leads/bulk/upload",
        {
          method: "POST",
          body: fd, // let the browser set multipart/form-data with boundary
        }
      );

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        throw new Error(
          (payload && (payload.message || payload.error)) ||
            (typeof payload === "string" ? payload : `HTTP ${res.status}`)
        );
      }

      toast.success("Bulk Lead is uploaded");
      setHitApi(!hitApi);
      setExcelFile(null);
      setLeadSourceDisplay(null);
      formEl.reset();
    } catch (err: any) {
      console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", err);
      toast.error("Bulk upload failed - all rows invalid");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Directly set date input value, as it is already in YYYY-MM-DD format
    // const formattedValue = name === 'birthdate' ? value : value;

    setFilterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const filterDataValue = () => {
    const filters: string[] = [];
    if (filterData.name) filters.push(`Name: ${filterData.name}`);
    if (filterData.mobilephonenumber)
      filters.push(`Phone: ${filterData.mobilephonenumber}`);
    setAppliedFilters(filters);
  };

  const createLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(true);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(false);
    setIsagentBulkCehckAssign(false);
  };
  const bulkLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(true);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(false);
    setIsagentBulkCehckAssign(false);
  };
  const filterLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(true);
    setIsEditLead(false);
    setIsAgent(false);
    setIsagentBulkCehckAssign(false);
  };
  const editLead = (editData: any) => {
    setEditLeadData(editData);
    setFlyoutOpen(true);
    setIsEditLead(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsAgent(false);
    setIsagentBulkCehckAssign(false);
  };
  const assignAgent = (leadId: string) => {
    setCurrentLeadId(leadId);
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(true);
    setIsagentBulkCehckAssign(false);
  };
  const assignCheckBulklead = () => {
    //setCurrentLeadId(leadId);
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(false);
    setIsagentBulkCehckAssign(true);
  };

  const unAssignfetchData = async () => {
    // setIsLoading(true);
    // setIsFilter(false);
    try {
      const response = await AxiosProvider.get(
        `/leads/notassigned?page=${unAssignPage}&pageSize=${globalPageSize}`
      );
      // console.log("KKKKKKKKKKKKKKKKK", response.data.data.data);
      setUsAssignTotalPages(response.data.data.pagination.totalPages);
      const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
      setNotAssignData(result);
    } catch (error: any) {
      setIsError(true);
    }
  };

  useEffect(() => {
    unAssignfetchData();
  }, [unAssignPage, hitApi]);

  const assignfetchData = async () => {
    // setIsLoading(true);
    // setIsFilter(false);
    try {
      const response = await AxiosProvider.get(
        `/leads/assigned?page=${assignPage}&pageSize=${globalPageSize}`
      );
      console.log("KKKKKKKKKKKKKKKKK", response.data.data.data);
      setassignTotalPages(response.data.data.pagination.totalPages);
      const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
      setAssignLeadData(result);
    } catch (error: any) {
      setIsError(true);
    }
  };

  useEffect(() => {
    assignfetchData();
  }, [assignPage, hitApi]);

  const leadSource = async () => {
    try {
      const response = await AxiosProvider.get("/leadsources");
      // console.log("KKKKKKKKMMMMMMM", response.data.data.data);
      setLeadSourceData(response.data.data.data);

      // const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    leadSource();
  }, []);

  const consolidationStatus = async () => {
    try {
      const response = await AxiosProvider.get("/getconsolidation");
      //  console.log("KKKKKKKKMMMMMMM", response.data.data.data);
      setConsolidationData(response.data.data.data);

      // const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    consolidationStatus();
  }, []);

  const debtConsolidationStatus = async () => {
    try {
      const response = await AxiosProvider.get("/leaddebtstatuses");
      //  console.log("GGGGGGGGGGGGGGGG", response.data.data.data);
      setDebtConsolidation(response.data.data.data);

      // const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    debtConsolidationStatus();
  }, []);

  const hadleClear = () => {
    setFilterData({ ...filterData, name: "", mobilephonenumber: "" });
  };
  // const handlePageChangeFilter = (newPage: number) => {
  //   if (newPage > 0 && newPage <= totalPagesFilter) {
  //     setFilterPage(newPage);
  //     userFilterData(newPage, filterPage);
  //   }
  // };

  const test = (id: string) => {
    window.open(`/leadsdetails?id=${id}`, "_blank"); // "_blank" = new tab
  };

  // fetch agents
  const fetchAgent = async () => {
    try {
      const res = await AxiosProvider.get("/allagents");
      // adjust this if your payload differs
      const list: Agent[] = res.data?.data?.data ?? [];
      setAgentList(list);
    } catch (error: any) {
      console.error("Error fetching agents:", error);
      setAgentList([]);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, []);
  const handleSubmitAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) {
      toast.error("Please select an agent");
      return;
    }
    setFlyoutOpen(false);
    //return;
    try {
      await AxiosProvider.post("/assignlead", {
        lead_id: currentLeadId,
        agent_id: selectedAgent.id,
      });
      toast.success("Lead is Updated");
      setHitApi(!hitApi);
      setSelectedAgent(null);
    } catch (error: any) {
      toast.error("Lead is not Updated");
    }
    // console.log("✅ Selected Agent Name:", selectedAgent.name);
    //  console.log("✅ Selected Agent ID:", selectedAgent.id);

    // Example: post to API
    // await AxiosProvider.post("/assign-agent", { agent_id: selectedAgent.id });
  };

  const deleteUserLead = async (leadId: string) => {
    //console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",leas)
    const userID = leadId; // extract the actual ID
    console.log("LEAD DELETE ID", userID);

    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this Lead?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AxiosProvider.post("/leads/soft-delete", { id: userID });
          toast.success("Successfully Deleted");
          setHitApi((prev) => !prev); // toggle to refresh
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };

  const toCleanFilter = (raw: FilterValues) => {
    const out: Record<string, any> = {};
    Object.entries(raw).forEach(([k, v]) => {
      const t = String(v ?? "").trim();
      if (t !== "") out[k] = t;
    });
    return out;
  };

  // const handleNotAssign = async (values: FilterValues) => {
  //   console.log("FITLER VALUE NOT CLEAN", values);

  // };
  // you handle API/state with this
  // const handleAssign = async (values: FilterValues) => {
  //    console.log("FITLER VALUE NOT CLEAN", values);

  // };
  const clickedFilterClear = () => {
    setClearFilter(false);
    setHitApi(!hitApi);
    setUnAssignFilterPagination(false);
    setAssignFilterPagination(false);
  };

  // HANDLE API TO UPDATE PAGINATION
  const handleAssignFilter = async () => {
    if (!assignFilteredData || Object.keys(assignFilteredData).length === 0)
      return;
    //  console.log("Assign values:", values);
    // const clean = buildCleanPayload(values as FilterFormValues);
    //       if (!hasAnyField(clean)) {
    //   toast.error("Please fill at least one field before submitting.");
    //   return;
    // }
    // setAssignFilteredData(values)
    //  console.log("unassign filter valuessssss",clean)
    //return;

    try {
      const response = await AxiosProvider.post(
        `/leads/filter?page=${assignPageFilter}&pageSize=${globalPageSize}`,

        assignFilteredData
      );
      // console.log("FILTERED VALUE", response.data.data.pagination.totalPages);
      setAssignLeadData(response.data.data.data);
      setFlyoutOpen(false);
      setClearFilter(true);
      setAssignTotalPagesFilter(response.data.data.pagination.totalPages);
      setAssignFilterPagination(true);
    } catch (error: any) {
      console.log("assign filter error", error);
      toast.error("Lead is not Created");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleAssignFilter();
  }, [assignPageFilter]);

  const handleUnassignFilter = async () => {
    if (!unAssignFilteredData || Object.keys(unAssignFilteredData).length === 0)
      return;
    // console.log("NotAssign values:", values);
    // const clean = buildCleanPayload(values as FilterFormValues);

    //  if (!hasAnyField(clean)) {
    //    toast.error("Please fill at least one field before submitting.");
    //    return;
    //  }
    //setUnAssignFilteredData(values)

    try {
      const response = await AxiosProvider.post(
        `/notassignedleads/filter?page=${assignPageFilter}&pageSize=${globalPageSize}`,
        unAssignFilteredData
      );
      console.log("NOT ASSIGN FILTERED VALUE", response);
      setUnAssignTotalPagesFilter(response.data.data.pagination.totalPages);
      setNotAssignData(response.data.data.data);
      setFlyoutOpen(false);
      setClearFilter(true);
      setUnAssignFilterPagination(true);
    } catch (error: any) {
      toast.error("Lead is not Created");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleUnassignFilter();
  }, [UnAssignPageFilter]);

  // HANDLE API TO UPDATE PAGINATION

  // PAGINATION HANDLE CHANGES

  const handleUnAssignPagination = (newPage: number) => {
    if (newPage > 0 && newPage <= unAssignTotalPages) {
      setUnAssignPage(newPage);
    }
  };
  const handleUnAssignPaginationFilter = (newPage: number) => {
    if (newPage > 0 && newPage <= UnAssignTotalPagesFilter) {
      setUnAssignPageFilter(newPage);
    }
  };

  const handleAssignPagination = (newPage: number) => {
    if (newPage > 0 && newPage <= assignTotalPages) {
      setAssignPage(newPage);
    }
  };
  const handleAssignPaginationFilter = (newPage: number) => {
    if (newPage > 0 && newPage <= assignTotalPagesFilter) {
      setAssignPageFilter(newPage);
    }
  };

  // END PAGINATION HANDLE CHANGES

  const status = [
    { id: "hot-lead", name: "Hot lead" },
    { id: "no-connect", name: "No connect" },
    { id: "under-discussion", name: "Under Discussion" },
    { id: "not-interested", name: "Not interested" },
    { id: "agreement-send", name: "Agreement send" },
    { id: "signed-agreement-received", name: "Signed agreement received" },
    { id: "hold", name: "Hold" },
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center">
        <Image
          src="/images/crmlogo.jpg"
          alt="Table image"
          width={500}
          height={500}
          style={{ width: "150px", height: "auto" }}
          className="animate-pulse rounded"
        />
      </div>
    );
  }

  //   function setFieldValue(arg0: string, arg1: any) {
  //     throw new Error("Function not implemented.");
  //   }

  // Removed duplicate setExcelFile function to fix identifier conflict.
  const tabs = [
    {
      label: "Unassign Leads",
      content: (
        <>
          {/* Tab content 3 */}
          <table className="w-full text-sm text-left text-white  whitespace-nowrap">
            <thead className="text-xs text-[#999999] talbleheaderBg">
              <tr className=" ">
                <th scope="col" className="px-3 py-3 md:p-3  ">
                  <div className="flex items-center gap-2">
                    <FaRegCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Select
                    </span>
                  </div>
                </th>
                {/* Name - Birth Date: Always Visible */}
                <th scope="col" className="px-3 py-3 md:p-3  ">
                  <div className="flex items-center gap-2">
                    <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Full Name
                    </span>
                  </div>
                </th>

                {/* Other columns: Hidden on mobile, visible from md: */}
                <th scope="col" className="px-3 py-2   hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <IoMailOpenOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Email
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2   hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <MdOutlinePhone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Phone
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2   hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <MdOutlineLocationCity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Address
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2   md:table-cell">
                  <div className="flex items-center gap-2">
                    <MdOutlineSettings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Action
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {!notAssignData || notAssignData.length === 0 || isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-xl mt-5 text-white"
                  >
                    <div className="mt-5">Data not found</div>
                  </td>
                </tr>
              ) : (
                notAssignData.map((item: any, index: number) => (
                  <tr
                    key={item?.id ?? index}
                    className="  hover:bg-primary-700 border-b border-[#E7E7E7] odd:bg-[#404040]"
                  >
                    <td className="px-3 py-2   text-center">
                      <input
                        type="checkbox"
                        className="accent-primary-600"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => toggleRow(item.id, e.target.checked)}
                      />
                    </td>

                    {/* Full name */}
                    <td className="px-1 py-2 md:px-3 md:py-3  flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="md:hidden">
                          <FaEllipsisVertical
                            data-tooltip-id="my-tooltip"
                            data-tooltip-html={`<div>
                      <strong>Name:</strong> <span style="text-transform: capitalize;">${
                        item?.full_name ?? "-"
                      }</span><br/>
                      <strong>Email:</strong> ${item?.email ?? "-"}<br/>
                      <strong>Phone:</strong> ${item?.phone ?? "-"}<br/>
                      <strong>Owner:</strong> ${item?.owner_name ?? "-"}<br/>
                      <strong>Account Manager:</strong> ${
                        item?.account_manager ?? "-"
                      }
                    </div>`}
                            className="text-white leading-normal relative top-[5.3px] capitalize"
                          />
                          <Tooltip
                            id="my-tooltip"
                            place="right"
                            float
                            className="box"
                          />
                        </div>
                        <div>
                          <p className=" text-sm sm:text-base font-medium leading-normal capitalize">
                            {item?.full_name ?? "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-3 py-2   hidden md:table-cell">
                      <span className="text-white text-sm sm:text-base">
                        {item?.email ?? "-"}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-2   hidden md:table-cell">
                      <span className="text-white text-sm sm:text-base">
                        {item?.phone ?? "-"}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2   hidden md:table-cell">
                      <span className="text-white text-sm sm:text-base capitalize">
                        {item?.address.line1 ?? "-"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-3 py-2   md:table-cell">
                      <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                        <button
                          onClick={() => editLead(item)}
                          className="py-1 px-3 bg-black hover:bg-primary-800 active:bg-primary-800 flex gap-2 items-center rounded-xl"
                        >
                          <MdEdit className="text-white w-4 h-4 hover:text-white" />
                          {/* <span className="text-xs sm:text-sm text-white hover:text-white">Edit</span> */}
                        </button>
                        {userRole === "Admin" && (
                          <button
                            onClick={() => assignAgent(item.id)}
                            className="py-1 px-3 bg-black hover:bg-primary-800 active:bg-primary-800 flex gap-2 items-center rounded-xl"
                          >
                            <BiUserPin className="text-white w-4 h-4 hover:text-white" />
                            {/* <span className="text-xs sm:text-sm text-white hover:text-white">Assign to agent</span> */}
                          </button>
                        )}
                        {userRole === "Admin" && (
                          <button
                            onClick={() => deleteUserLead(item.id)}
                            className="py-1 px-3 bg-black hover:bg-primary-800 active:bg-primary-800 flex gap-2 items-center rounded-xl"
                          >
                            <RiDeleteBin6Line className="text-white w-4 h-4 hover:text-white" />
                            {/* <span className="text-xs sm:text-sm text-white hover:text-white">Delete</span> */}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* UNASSIGN PAGINATION */}
          {unAssignFilterPagination ? (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() =>
                  handleUnAssignPaginationFilter(UnAssignPageFilter - 1)
                }
                disabled={UnAssignPageFilter === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className="w-6 h-auto" />
              </button>
              <span className="text-white text-sm">
                Page {UnAssignPageFilter} of {UnAssignTotalPagesFilter}
              </span>
              <button
                onClick={() =>
                  handleUnAssignPaginationFilter(UnAssignPageFilter + 1)
                }
                disabled={UnAssignPageFilter === UnAssignTotalPagesFilter}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className="w-6 h-auto" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handleUnAssignPagination(unAssignPage - 1)}
                disabled={unAssignPage === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className="w-6 h-auto" />
              </button>
              <span className="text-white text-sm">
                Page {unAssignPage} of {unAssignTotalPages}
              </span>
              <button
                onClick={() => handleUnAssignPagination(unAssignPage + 1)}
                disabled={unAssignPage === unAssignTotalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className="w-6 h-auto" />
              </button>
            </div>
          )}
          {/* END PAGINATION */}
        </>
      ),
      // End Tab content 2
    },
    {
      label: "Assign Leads",
      content: (
        <>
          {/* Tab content 3 */}
          <table className="w-full text-sm text-left text-white  whitespace-nowrap">
            <thead className="text-xs text-[#999999] talbleheaderBg">
              <tr className=" ">
                {/* Name - Birth Date: Always Visible */}
                <th scope="col" className="px-3 py-3 md:p-3  ">
                  <div className="flex items-center gap-2">
                    <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Full Name
                    </span>
                  </div>
                </th>

                {/* Other columns: Hidden on mobile, visible from md: */}
                <th scope="col" className="px-3 py-2   hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <IoMailOpenOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Email
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2   hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <MdOutlinePhone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Phone
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2   hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <MdOutlineLocationCity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Address
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2   hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <ImUserTie className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Agent
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2   md:table-cell">
                  <div className="flex items-center gap-2">
                    <MdOutlineSettings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="font-semibold text-white text-lg sm:text-base">
                      Action
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {!assignLeadData || assignLeadData.length === 0 || isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-xl mt-5 text-white"
                  >
                    <div className="mt-5">Data not found</div>
                  </td>
                </tr>
              ) : (
                assignLeadData.map((item: any, index: number) => (
                  <tr
                    key={item?.id ?? index}
                    className="  odd:bg-[#404040] hover:bg-primary-700 py-3 border-b border-[#E7E7E7]"
                  >
                    {/* Full name */}
                    <td
                      onClick={() => test(item.id)}
                      className="px-1 py-2 md:px-3 md:py-3 flex items-center gap-2 text-primary-600 underline cursor-pointer"
                    >
                      <div className="flex gap-2">
                        <div className="md:hidden">
                          <FaEllipsisVertical
                            data-tooltip-id="my-tooltip"
                            data-tooltip-html={`<div>
                      <strong>Name:</strong> <span style="text-transform: capitalize;">${
                        item?.full_name ?? "-"
                      }</span><br/>
                      <strong>Email:</strong> ${item?.email ?? "-"}<br/>
                      <strong>Phone:</strong> ${item?.phone ?? "-"}<br/>
                      <strong>Owner:</strong> ${item?.owner_name ?? "-"}<br/>
                      <strong>Account Manager:</strong> ${
                        item?.account_manager ?? "-"
                      }
                    </div>`}
                            className="text-white leading-normal relative top-[5.3px] capitalize"
                          />
                          <Tooltip
                            id="my-tooltip"
                            place="right"
                            float
                            className="box"
                          />
                        </div>
                        <div className="cursor-pointer">
                          <p className="text-primary-600 text-sm sm:text-base font-medium leading-normal capitalize">
                            {item?.full_name ?? "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-3 py-2   hidden md:table-cell">
                      <span className="text-white text-sm sm:text-base">
                        {item?.email ?? "-"}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-2   hidden md:table-cell">
                      <span className="text-white text-sm sm:text-base">
                        {item?.phone ?? "-"}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2   hidden md:table-cell">
                      <span className="text-white text-sm sm:text-base capitalize">
                        {item?.address.line1 ?? "-"}
                      </span>
                    </td>

                    {/* Agent */}
                    <td className="px-3 py-2   hidden md:table-cell">
                      <span className="text-white text-sm sm:text-base capitalize">
                        {item?.agent.name ?? "-"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-3 py-2   md:table-cell">
                      <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                        <button
                          onClick={() => editLead(item)}
                          className="py-1 px-3 bg-black hover:bg-primary-800 active:bg-primary-800 flex gap-2 items-center rounded-xl"
                        >
                          <MdEdit className="text-white w-4 h-4 hover:text-white" />
                          {/* <span className="text-xs sm:text-sm text-white hover:text-white">Edit</span> */}
                        </button>

                        {userRole === "Admin" && (
                          <button
                            onClick={() => deleteUserLead(item.id)}
                            className="py-1 px-3 bg-black hover:bg-primary-800 active:bg-primary-800 flex gap-2 items-center rounded-xl"
                          >
                            <RiDeleteBin6Line className="text-white w-4 h-4 hover:text-white" />
                            {/* <span className="text-xs sm:text-sm text-white hover:text-white">Delete</span> */}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* UNASSIGN PAGINATION */}
          {assignFilterPagination ? (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() =>
                  handleAssignPaginationFilter(assignPageFilter - 1)
                }
                disabled={assignPageFilter === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className="w-6 h-auto" />
              </button>
              <span className="text-white text-sm">
                Assign leads filter pagination Page {assignPageFilter} of{" "}
                {assignTotalPagesFilter}
              </span>
              <button
                onClick={() =>
                  handleAssignPaginationFilter(assignPageFilter + 1)
                }
                disabled={assignPageFilter === assignTotalPagesFilter}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className="w-6 h-auto" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handleAssignPagination(assignPage - 1)}
                disabled={assignPage === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className="w-6 h-auto" />
              </button>
              <span className="text-white text-sm">
                Assign leads pagination Page {assignPage} of {assignTotalPages}
              </span>
              <button
                onClick={() => handleAssignPagination(assignPage + 1)}
                disabled={assignPage === assignTotalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className="w-6 h-auto" />
              </button>
            </div>
          )}
          {/* END PAGINATION */}
        </>
      ),
    },
  ];
  if (checking) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center bg-white">
        <Image
          src="/images/orizonIcon.svg"
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
      <LeftSideBar />
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <div className=" ml-[97px] w-full md:w-[90%] m-auto  min-h-[500px]  rounded p-4 mt-0 ">
          {/* left section top row */}
          <DesktopHeader />
          {/* Main content middle section */}
          {/* ----------------Table----------------------- */}
          <div className="relative overflow-x-auto shadow-lastTransaction rounded-xl sm:rounded-3xl px-1 py-6 md:p-6   z-10 mainContainerBg">
            {/* Search and filter table row */}
            <div className=" flex justify-between items-center mb-6  w-full mx-auto">
              <div>
                {selectedIds.length > 0 && (
                  <div className=" flex items-center ">
                    {/* <button
                onClick={()=>assignCheckBulklead()}
                className="flex justify-center gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                title="Perform bulk action"
              >
                Bulk Checked Assign to Agent ({selectedIds.length})
              </button> */}
                    {/* <span className="text-sm text-gray-600">
                {selectedIds.length} selected
              </span> */}
                    <div
                      className=" flex justify-center gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-800 group"
                      onClick={() => assignCheckBulklead()}
                    >
                      <FiFilter className=" w-5 h-5 text-white group-hover:text-white" />
                      <p className=" text-white text-base font-medium group-hover:text-white">
                        Assign Agent Bulk ({selectedIds.length})
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className=" flex justify-center items-center gap-4">
                <div
                  className=" flex justify-center gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-700 group"
                  onClick={() => createLeads()}
                >
                  <FiPlusCircle className=" w-5 h-5 text-white group-hover:text-white" />
                  <p className=" text-white text-base font-medium group-hover:text-white">
                    Create Leads
                  </p>
                </div>

                {userRole === "Admin" && (
                  <div
                    className=" flex justify-center  gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-700 group"
                    onClick={() => bulkLeads()}
                  >
                    <MdOutlineDriveFolderUpload className=" w-5 h-5 text-white group-hover:text-white" />
                    <p className=" text-white text-base font-medium group-hover:text-white">
                      Bulk Leads
                    </p>
                  </div>
                )}

                <div
                  className=" flex justify-center  gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-700 group"
                  onClick={() => filterLeads()}
                >
                  <FaSearchPlus className=" w-5 h-5 text-white group-hover:text-white" />
                  <p className=" text-white text-base font-medium group-hover:text-white">
                    Search Leads
                  </p>
                </div>
              </div>
            </div>
            {/* End search and filter row */}
            <div className="w-full overflow-x-auto custom-scrollbar">
              {clearFilter && (
                <button
                  type="button"
                  onClick={() => clickedFilterClear()}
                  className="flex items-center gap-2 text-primary-600 text-sm font-medium transition-colors p-1 border border-primary-500 rounded mb-2"
                >
                  <span>Clear Filter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            {/* Show Applied Filters */}
            {userRole === "Admin" && <Tabs tabs={tabs} />}

            {userRole === "Agent" && (
              <table className="w-full text-sm text-left text-white bg-black whitespace-nowrap">
                <thead className="text-xs bg-primary-500 text-white">
                  <tr className=" ">
                    {/* Full Name */}
                    <th className="px-3 py-3 md:p-3  ">
                      <div className="flex items-center gap-2">
                        <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Full Name
                        </span>
                      </div>
                    </th>

                    {/* Email */}
                    <th className="px-3 py-2   hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <IoMailOpenOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Email
                        </span>
                      </div>
                    </th>

                    {/* Phone */}
                    <th className="px-3 py-2   hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <MdOutlinePhone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Phone
                        </span>
                      </div>
                    </th>

                    {/* Address */}
                    <th className="px-3 py-2   hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <MdOutlineLocationCity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="font-semibold text-white text-lg sm:text-base">
                          Address
                        </span>
                      </div>
                    </th>

                    {/* Agent */}
                    <th className="px-3 py-2   hidden md:table-cell">
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
                  {!assignLeadData || assignLeadData.length === 0 || isError ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-white">
                        Data not found
                      </td>
                    </tr>
                  ) : (
                    assignLeadData.map((item: any, index: number) => (
                      <tr
                        key={item?.id ?? index}
                        className="  bg-black hover:bg-primary-600"
                      >
                        {/* Full Name */}
                        <td
                          className="px-3 py-2   flex items-center gap-2 bg-primary-500 cursor-pointer"
                          onClick={() => test(item.id)}
                        >
                          <p className="text-white font-medium capitalize">
                            {item?.full_name ?? "-"}
                          </p>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2   hidden md:table-cell">
                          <span className="text-white">
                            {item?.email ?? "-"}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-3 py-2   hidden md:table-cell">
                          <span className="text-white">
                            {item?.phone ?? "-"}
                          </span>
                        </td>

                        {/* Address */}
                        <td className="px-3 py-2   hidden md:table-cell">
                          <span className="text-white capitalize">
                            {item?.address.country ?? "-"}
                          </span>
                        </td>

                        {/* Agent */}
                        <td className="px-3 py-2   hidden md:table-cell">
                          <span className="text-white capitalize">
                            {item?.agent.name ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {userRole === "Agent" && (
              <>
                {assignFilterPagination ? (
                  <div className="flex justify-center items-center my-10 relative gap-2">
                    <button
                      onClick={() =>
                        handleAssignPaginationFilter(assignPageFilter - 1)
                      }
                      disabled={assignPageFilter === 1}
                      className="px-3 py-2 rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiChevronDoubleLeft className="w-6 h-auto" />
                    </button>
                    <span className="text-white text-sm">
                      Page {assignPageFilter} of {assignTotalPagesFilter}
                    </span>
                    <button
                      onClick={() =>
                        handleAssignPaginationFilter(assignPageFilter + 1)
                      }
                      disabled={assignPageFilter === assignTotalPagesFilter}
                      className="px-3 py-2 rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiChevronDoubleRight className="w-6 h-auto" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center my-10 relative gap-2">
                    <button
                      onClick={() => handleAssignPagination(assignPage - 1)}
                      disabled={assignPage === 1}
                      className="px-3 py-2 rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiChevronDoubleLeft className="w-6 h-auto" />
                    </button>
                    <span className="text-white text-sm">
                      Page {assignPage} of {assignTotalPages}
                    </span>
                    <button
                      onClick={() => handleAssignPagination(assignPage + 1)}
                      disabled={assignPage === assignTotalPages}
                      className="px-3 py-2 rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiChevronDoubleRight className="w-6 h-auto" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ---------------- Table--------------------------- */}

            {/* ----------------End table------------------------ */}
          </div>
          {/* Pagination Controls */}

          {/* ----------------End prgination--------------------------- */}

          {/* <div className="w-full h-24 bg-header-gradient opacity-20 absolute top-0 left-0 right-0 "></div> */}
        </div>
      </div>
      {/* START FLYOUT */}
      {/*  FLYOUT */}
      {isFlyoutOpen && (
        <div
          className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => {
            setFlyoutOpen(!isFlyoutOpen);
          }}
        ></div>
      )}

      <>
        <div className={`flyout ${isFlyoutOpen ? "open" : ""}`}>
          {isCreateLeads && (
            <div className="w-full min-h-auto p-4  text-white">
              {/* Flyout header */}
              <div className="flex justify-between mb-4">
                <p className="text-primary-500 text-2xl font-bold leading-9">
                  Create Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
                />
              </div>
              <div className="w-full border-b border-gray-700 mb-4"></div>

              <Formik
                initialValues={{
                  full_name: "",
                  email: "",
                  phone: "",
                  address_line1: "",
                  city: "",
                  state: "",
                  postal_code: "",
                  lead_score: undefined as number | undefined,
                  best_time_to_call: "",
                  lead_source_id: "",
                  debt_consolidation_status_id: "",
                  whatsapp_number: "",
                  agent_id: "",
                  consolidated_credit_status_id: "",
                  status: "",
                  company: "",
                }}
                validationSchema={LeadSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  const value: any = { ...values, id: "" };
                  handleCreateLead(value);
                  setSubmitting(false);
                  resetForm();
                }}
              >
                {({
                  handleSubmit,
                  isSubmitting,
                  values,
                  setFieldValue,
                  setFieldTouched,
                }) => (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Full Name
                        </p>
                        <Field
                          type="text"
                          name="full_name"
                          placeholder="Alexandre Dumas"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="full_name"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Email */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Email
                        </p>
                        <Field
                          type="email"
                          name="email"
                          placeholder="alexandre@example.com"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Phone */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Phone
                        </p>
                        <Field
                          type="text"
                          name="phone"
                          placeholder="+91 9XXXXXXXXX"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Address Line 1 */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Address Line 1
                        </p>
                        <Field
                          type="text"
                          name="address_line1"
                          placeholder="Street, House no."
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="address_line1"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Province / State (Text Input) */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Province / State
                        </p>
                        <Field
                          type="text"
                          name="state"
                          placeholder="Enter Province / State"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="state"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Postal Code */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Postal Code
                        </p>
                        <Field
                          type="text"
                          name="postal_code"
                          placeholder="400071"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="postal_code"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Best Time to Call */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Best Time to Call
                        </p>
                        <Field
                          type="text"
                          name="best_time_to_call"
                          placeholder="e.g., 3–5 PM"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="best_time_to_call"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Lead Source Dropdown */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Lead Source
                        </p>
                        <Select
                          value={
                            (leadSourceData || []).find(
                              (opt: any) => opt.id === values.lead_source_id
                            ) || null
                          }
                          onChange={(selected: any) =>
                            setFieldValue(
                              "lead_source_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() => setFieldTouched("lead_source_id", true)}
                          getOptionLabel={(opt: any) => opt.name}
                          getOptionValue={(opt: any) => opt.id}
                          options={leadSourceData}
                          placeholder="Select Lead Source"
                          isClearable
                          classNames={{
                            control: ({ isFocused }: any) =>
                              `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                                isFocused
                                  ? "!border-primary-500"
                                  : "!border-gray-700"
                              }`,
                          }}
                          styles={{
                            menu: (base) => ({
                              ...base,
                              borderRadius: 4,
                              backgroundColor: "#000",
                            }),
                            option: (base, { isFocused, isSelected }) => ({
                              ...base,
                              backgroundColor: isSelected
                                ? "var(--primary-600)"
                                : isFocused
                                ? "#222"
                                : "#000",
                              color: "#fff",
                              cursor: "pointer",
                            }),
                            singleValue: (base) => ({ ...base, color: "#fff" }),
                            input: (base) => ({ ...base, color: "#fff" }),
                            placeholder: (base) => ({ ...base, color: "#aaa" }),
                          }}
                        />
                      </div>

                      {/* WhatsApp Number */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          WhatsApp Number
                        </p>
                        <Field
                          type="text"
                          name="whatsapp_number"
                          placeholder="+91 9XXXXXXXXX"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="whatsapp_number"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Company */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Company
                        </p>
                        <Field
                          type="text"
                          name="company"
                          placeholder="Enter Company Name"
                          className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3 placeholder-gray-400"
                        />
                        <ErrorMessage
                          name="company"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Assign to Agent Dropdown */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Assign to Agent
                        </p>
                        <Select
                          value={
                            (agentList || []).find(
                              (opt: any) =>
                                String(opt.id) === String(values.agent_id)
                            ) || null
                          }
                          onChange={(selected: any) =>
                            setFieldValue(
                              "agent_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() => setFieldTouched("agent_id", true)}
                          getOptionLabel={(opt: any) => opt.name}
                          getOptionValue={(opt: any) => String(opt.id)}
                          options={agentList}
                          placeholder="Select Agent"
                          isClearable
                          classNames={{
                            control: ({ isFocused }: any) =>
                              `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                                isFocused
                                  ? "!border-primary-500"
                                  : "!border-gray-700"
                              }`,
                          }}
                          styles={{
                            menu: (base) => ({
                              ...base,
                              borderRadius: 4,
                              backgroundColor: "#000",
                            }),
                            option: (base, { isFocused, isSelected }) => ({
                              ...base,
                              backgroundColor: isSelected
                                ? "var(--primary-600)"
                                : isFocused
                                ? "#222"
                                : "#000",
                              color: "#fff",
                              cursor: "pointer",
                            }),
                            singleValue: (base) => ({ ...base, color: "#fff" }),
                            input: (base) => ({ ...base, color: "#fff" }),
                            placeholder: (base) => ({ ...base, color: "#aaa" }),
                          }}
                        />
                        <ErrorMessage
                          name="agent_id"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Status Dropdown (Replaced Debt Consolidation Status) */}
                      <div className="w-full">
                        <p className="text-white text-base leading-6 mb-2">
                          Status
                        </p>
                        <Select
                          value={
                            (status || []).find(
                              (opt: any) => opt.id === values.status
                            ) || null
                          }
                          onChange={(selected: any) =>
                            setFieldValue("status", selected ? selected.id : "")
                          }
                          onBlur={() => setFieldTouched("status", true)}
                          getOptionLabel={(opt: any) => opt.name}
                          getOptionValue={(opt: any) => opt.id}
                          options={status} // Pass the options for the Status dropdown
                          placeholder="Select Status"
                          isClearable
                          classNames={{
                            control: ({ isFocused }: any) =>
                              `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                                isFocused
                                  ? "!border-primary-500"
                                  : "!border-gray-700"
                              }`,
                          }}
                          styles={{
                            menu: (base) => ({
                              ...base,
                              borderRadius: 4,
                              backgroundColor: "#000",
                            }),
                            option: (base, { isFocused, isSelected }) => ({
                              ...base,
                              backgroundColor: isSelected
                                ? "var(--primary-600)"
                                : isFocused
                                ? "#222"
                                : "#000",
                              color: "#fff",
                              cursor: "pointer",
                            }),
                            singleValue: (base) => ({ ...base, color: "#fff" }),
                            input: (base) => ({ ...base, color: "#fff" }),
                            placeholder: (base) => ({ ...base, color: "#aaa" }),
                          }}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-primary-600 rounded-[4px] text-white text-base font-medium hover:bg-primary-700"
                    >
                      {isSubmitting ? "Creating..." : "Create Leads"}
                    </button>
                  </form>
                )}
              </Formik>
            </div>
          )}

          {isBulkLeads && (
            <div className="w-full min-h-auto p-4  text-white">
              {/* Flyout header */}
              <div className="flex justify-between mb-4">
                <p className="text-primary-500 text-2xl font-bold leading-9">
                  Bulk Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
                />
              </div>
              <div className="w-full border-b border-gray-700 mb-4"></div>

              {/* FORM */}
              <form onSubmit={handleUploadFile}>
                <div className="w-full">
                  {/* File Upload Input */}
                  <div className="w-full mb-4">
                    <p className="text-white font-medium text-base leading-6 mb-2">
                      Upload Excel File
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      name="file"
                      onChange={(e) =>
                        setExcelFile(e.target.files?.[0] ?? null)
                      }
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 text-white !bg-black"
                    />
                  </div>

                  {/* Lead Source Dropdown */}
                  <div className="w-full mb-4">
                    <p className="text-white text-base leading-6 mb-2">
                      Lead Source
                    </p>
                    <Select
                      value={leadSourceDisplay}
                      onChange={(selected: any) =>
                        setLeadSourceDisplay(selected)
                      }
                      getOptionLabel={(opt: any) => opt.name}
                      getOptionValue={(opt: any) => String(opt.id)}
                      options={leadSourceData}
                      placeholder="Select Lead Source"
                      isClearable
                      classNames={{
                        control: ({ isFocused }: any) =>
                          `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                            isFocused
                              ? "!border-primary-500"
                              : "!border-gray-700"
                          }`,
                      }}
                      styles={{
                        menu: (base) => ({
                          ...base,
                          borderRadius: 4,
                          backgroundColor: "#000",
                        }),
                        option: (base, { isFocused, isSelected }) => ({
                          ...base,
                          backgroundColor: isSelected
                            ? "var(--primary-600)"
                            : isFocused
                            ? "#222"
                            : "#000",
                          color: "#fff",
                          cursor: "pointer",
                        }),
                        singleValue: (base) => ({ ...base, color: "#fff" }),
                        input: (base) => ({ ...base, color: "#fff" }),
                        placeholder: (base) => ({ ...base, color: "#aaa" }),
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:bg-primary-700 w-full"
                >
                  Upload File
                </button>
              </form>
            </div>
          )}

          {isFilter && (
            <div className="w-full min-h-auto p-4  text-white">
              {/* Flyout header */}
              <div className="flex justify-between mb-4">
                <p className="text-primary-500 text-2xl font-bold leading-9">
                  Search Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
                />
              </div>
              <div className="w-full border-b border-gray-700 mb-4"></div>

<Formik
  enableReinitialize
  initialValues={{
    full_name: "",
    email: "",
    phone: "",
    lead_number: "",
    state: "",
    agent_ids: [] as string[],
    lead_source_id: "",
    status: "",
  }}
  onSubmit={() => {}}
>
  {({
    handleSubmit,
    values,
    setFieldValue,
    setFieldTouched,
    resetForm, // 👈 for clearing the form
    isSubmitting,
  }) => {
    const norm = (v: any) => String(v ?? "").toLowerCase();

    const leadSourceDisplay = values.lead_source_id
      ? (leadSourceData || []).find(
          (o: any) => norm(o.id) === norm(values.lead_source_id)
        ) || null
      : null;

    const agentDisplay =
      (values.agent_ids || [])
        .map((id: any) =>
          (agentList || []).find((o: any) => norm(o.id) === norm(id))
        )
        .filter(Boolean) || [];

    const statusDisplay = values.status
      ? (status || []).find((o: any) => norm(o.id) === norm(values.status)) ||
        null
      : null;

    const pruneEmpty = (obj: Record<string, any>) => {
      const out: Record<string, any> = {};
      Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          const arr = v.filter((x) => x !== "" && x != null);
          if (arr.length) out[k] = arr;
        } else if (v !== "" && v != null) {
          out[k] = v;
        }
      });
      return out;
    };

    const buildCleanPayload = (v: typeof values) => {
      const base = {
        ...v,
        agent_ids: (v.agent_ids || []).filter(Boolean),
      };
      return pruneEmpty(base);
    };

    const hasAnyField = (payload: Record<string, any>) =>
      Object.keys(payload).length > 0;

    const handleUnassignFilter = async () => {
      const clean = buildCleanPayload(values);
      if (!hasAnyField(clean)) {
        toast.error("Please fill at least one field before submitting.");
        return;
      }
      setUnAssignFilteredData(values);
      try {
        const response = await AxiosProvider.post(
          `/notassignedleads/filter?page=${assignPageFilter}&pageSize=${globalPageSize}`,
          clean
        );
        setUnAssignTotalPagesFilter(response.data.data.pagination.totalPages);
        setNotAssignData(response.data.data.data);
        setFlyoutOpen(false);
        setClearFilter(true);
        setUnAssignFilterPagination(true);
        toast.success("✅ Filter applied successfully (Unassigned Leads)");
        resetForm(); // 👈 clear form after success
      } catch (error: any) {
        toast.error("❌ Failed to filter Unassigned Leads");
      } finally {
        setIsLoading(false);
      }
    };

    const handleAssignFilter = async () => {
      const clean = buildCleanPayload(values);
      if (!hasAnyField(clean)) {
        toast.error("Please fill at least one field before submitting.");
        return;
      }
      setAssignFilteredData(values);
      try {
        const response = await AxiosProvider.post(
          `/leads/filter?page=${assignPageFilter}&pageSize=${globalPageSize}`,
          clean
        );
        setAssignLeadData(response.data.data.data);
        setFlyoutOpen(false);
        setClearFilter(true);
        setAssignTotalPagesFilter(response.data.data.pagination.totalPages);
        setAssignFilterPagination(true);
        toast.success("✅ Filter applied successfully (Assigned Leads)");
        resetForm(); // 👈 clear form after success
      } catch (error: any) {
        toast.error("❌ Failed to filter Assigned Leads");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Full Name */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">Full Name</p>
            <Field
              type="text"
              name="full_name"
              placeholder="Alexandre Dumas"
              className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-4 placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">Email</p>
            <Field
              type="email"
              name="email"
              placeholder="alexandre@example.com"
              className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-4 placeholder-gray-400"
            />
          </div>

          {/* Phone */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">Phone</p>
            <Field
              type="text"
              name="phone"
              placeholder="+91 9XXXXXXXXX"
              className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-4 placeholder-gray-400"
            />
          </div>

          {/* Lead Number */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">Lead Number</p>
            <Field
              type="text"
              name="lead_number"
              placeholder="LN-000123"
              className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-4 placeholder-gray-400"
            />
          </div>

          {/* State */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">State</p>
            <Field
              type="text"
              name="state"
              placeholder="Maharashtra"
              className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-4 placeholder-gray-400"
            />
          </div>

          {/* Agent (Multi) */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">Agent</p>
            <Select
              value={agentDisplay}
              onChange={(selected: any) =>
                setFieldValue(
                  "agent_ids",
                  selected ? selected.map((s: any) => s.id) : []
                )
              }
              onBlur={() => setFieldTouched("agent_ids", true)}
              getOptionLabel={(opt: any) => opt.name}
              getOptionValue={(opt: any) => String(opt.id)}
              options={agentList}
              placeholder="Select Agent"
              isMulti
              isClearable
              classNames={{
                control: ({ isFocused }: any) =>
                  `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                    isFocused ? "!border-primary-500" : "!border-gray-700"
                  }`,
              }}
              styles={{
                menu: (base) => ({
                  ...base,
                  borderRadius: 4,
                  backgroundColor: "#000",
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? "var(--primary-600)"
                    : isFocused
                    ? "#222"
                    : "#000",
                  color: "#fff",
                  cursor: "pointer",
                }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "#aaa" }),
              }}
            />
          </div>

          {/* Lead Source */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">Lead Source</p>
            <Select
              value={leadSourceDisplay}
              onChange={(selected: any) =>
                setFieldValue("lead_source_id", selected ? selected.id : "")
              }
              onBlur={() => setFieldTouched("lead_source_id", true)}
              getOptionLabel={(opt: any) => opt.name}
              getOptionValue={(opt: any) => String(opt.id)}
              options={leadSourceData}
              placeholder="Select Lead Source"
              isClearable
              classNames={{
                control: ({ isFocused }: any) =>
                  `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                    isFocused ? "!border-primary-500" : "!border-gray-700"
                  }`,
              }}
              styles={{
                menu: (base) => ({
                  ...base,
                  borderRadius: 4,
                  backgroundColor: "#000",
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? "var(--primary-600)"
                    : isFocused
                    ? "#222"
                    : "#000",
                  color: "#fff",
                  cursor: "pointer",
                }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "#aaa" }),
              }}
            />
          </div>

          {/* Status */}
          <div className="w-full">
            <p className="text-white text-base leading-6 mb-2">Status</p>
            <Select
              value={statusDisplay}
              onChange={(selected: any) =>
                setFieldValue("status", selected ? selected.id : "")
              }
              onBlur={() => setFieldTouched("status", true)}
              getOptionLabel={(opt: any) => opt.name}
              getOptionValue={(opt: any) => String(opt.id)}
              options={status}
              placeholder="Select Status"
              isClearable
              classNames={{
                control: ({ isFocused }: any) =>
                  `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                    isFocused ? "!border-primary-500" : "!border-gray-700"
                  }`,
              }}
              styles={{
                menu: (base) => ({
                  ...base,
                  borderRadius: 4,
                  backgroundColor: "#000",
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? "var(--primary-600)"
                    : isFocused
                    ? "#222"
                    : "#000",
                  color: "#fff",
                  cursor: "pointer",
                }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "#aaa" }),
              }}
            />
          </div>
        </div>

        <div className="flex gap-4">
          {userRole === "Admin" && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleUnassignFilter}
              className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-white text-base font-medium hover:bg-primary-700 w-full"
            >
              Search UnAssign leads
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAssignFilter}
            className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-white text-base font-medium hover:bg-primary-700 w-full"
          >
            Search Assign leads
          </button>
        </div>
      </form>
    );
  }}
</Formik>



            </div>
          )}
          {isEditLead && (
            <div className="w-full min-h-auto p-4 text-white">
              {/* Flyout header */}
              <div className="flex justify-between mb-4">
                <p className="text-primary-500 text-2xl font-bold leading-9">
                  Edit Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
                />
              </div>
              <div className="w-full border-b border-gray-700 mb-4"></div>

              <Formik
                enableReinitialize
                initialValues={{
                  id: editLeadData?.id ?? "",
                  full_name: editLeadData?.full_name ?? "",
                  email: editLeadData?.email ?? "",
                  phone: editLeadData?.phone ?? "",
                  whatsapp_number: editLeadData?.whatsapp_number ?? "",
                  address_line1: editLeadData?.address?.line1 ?? "",
                  address_line2: editLeadData?.address?.line2 ?? "",
                  company: editLeadData?.company ?? "",
                  city: editLeadData?.address?.city ?? "",
                  state: editLeadData?.address?.state ?? "",
                  postal_code: editLeadData?.address?.postal_code ?? "",
                  country: editLeadData?.address?.country ?? "",
                  lead_score:
                    typeof editLeadData?.lead_score === "number"
                      ? editLeadData.lead_score
                      : undefined,
                  lead_quality: editLeadData?.lead_quality ?? "",
                  best_time_to_call: editLeadData?.best_time_to_call ?? "",
                  lead_source_id: "",
                  status: "", // Add status field to handle dropdown
                }}
                validationSchema={LeadSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  const value: any = {
                    id: values.id,
                    full_name: values.full_name,
                    email: values.email,
                    phone: values.phone || undefined,
                   company: values.company || undefined,
                    whatsapp_number: values.whatsapp_number || undefined,
                    address_line1: values.address_line1 || undefined,
                    address_line2: values.address_line2 || undefined,
                    city: values.city || undefined,
                    state: values.state || undefined,
                    postal_code: values.postal_code || undefined,
                    country: values.country || undefined,
                    lead_score: values.lead_score ?? undefined,
                    lead_quality: values.lead_quality || undefined,
                    best_time_to_call: values.best_time_to_call || undefined,
                    lead_source_id: values.lead_source_id || undefined,
                    status: values.status || undefined, // Added status field
                  };

                  handleUpdateLead(value);
                  setSubmitting(false);
                  resetForm();
                }}
              >
                {({
                  handleSubmit,
                  values,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                }) => {
                  const norm = (v: any) => String(v ?? "").toLowerCase();

                  // Prefill dropdown displays
                  const leadSourcePrefill = editLeadData?.lead_source;
                  const leadSourceDisplay = values.lead_source_id
                    ? (leadSourceData || []).find(
                        (o: any) => norm(o.id) === norm(values.lead_source_id)
                      ) || null
                    : (leadSourceData || []).find(
                        (o: any) =>
                          norm(o.id) ===
                            norm(
                              (leadSourcePrefill as any)?.id ??
                                leadSourcePrefill
                            ) ||
                          norm(o.name) ===
                            norm(
                              (leadSourcePrefill as any)?.name ??
                                leadSourcePrefill
                            )
                      ) || null;

                  const statusPrefill = editLeadData?.status; // Prefill status
                  const statusDisplay = values.status
                    ? (status || []).find(
                        (o: any) => norm(o.id) === norm(values.status)
                      ) || null
                    : (status || []).find(
                        (o: any) =>
                          norm(o.id) ===
                            norm((statusPrefill as any)?.id ?? statusPrefill) ||
                          norm(o.name) ===
                            norm((statusPrefill as any)?.name ?? statusPrefill)
                      ) || null;

                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Full Name */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Full Name
                          </p>
                          <Field
                            type="text"
                            name="full_name"
                            placeholder="Alexandre Dumas"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* Email */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Email
                          </p>
                          <Field
                            type="email"
                            name="email"
                            placeholder="alexandre@example.com"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* Phone */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Phone
                          </p>
                          <Field
                            type="text"
                            name="phone"
                            placeholder="+91 9XXXXXXXXX"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* WhatsApp Number */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            WhatsApp Number
                          </p>
                          <Field
                            type="text"
                            name="whatsapp_number"
                            placeholder="+91 9XXXXXXXXX"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* Company */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Company
                          </p>
                          <Field
                            type="text"
                            name="company"
                            placeholder="Enter Company Name"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* Address Line 1 */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Address Line 1
                          </p>
                          <Field
                            type="text"
                            name="address_line1"
                            placeholder="Street, House no."
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* State */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            State
                          </p>
                          <Field
                            type="text"
                            name="state"
                            placeholder="Maharashtra"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* Postal Code */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Postal Code
                          </p>
                          <Field
                            type="text"
                            name="postal_code"
                            placeholder="400071"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* Best Time to Call */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Best Time to Call
                          </p>
                          <Field
                            type="text"
                            name="best_time_to_call"
                            placeholder="e.g., 3–5 PM"
                            className="w-full border border-[#444] rounded-[4px] py-4 px-4 text-white bg-black placeholder-gray-400"
                          />
                        </div>

                        {/* Lead Source Dropdown */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Lead Source
                          </p>
                          <Select
                            value={leadSourceDisplay}
                            onChange={(selected: any) =>
                              setFieldValue(
                                "lead_source_id",
                                selected ? selected.id : ""
                              )
                            }
                            onBlur={() =>
                              setFieldTouched("lead_source_id", true)
                            }
                            getOptionLabel={(opt: any) => opt.name}
                            getOptionValue={(opt: any) => String(opt.id)}
                            options={leadSourceData}
                            placeholder="Select Lead Source"
                            isClearable
                            classNames={{
                              control: ({ isFocused }: any) =>
                                `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                                  isFocused
                                    ? "!border-primary-500"
                                    : "!border-gray-700"
                                }`,
                            }}
                            styles={{
                              menu: (base) => ({
                                ...base,
                                borderRadius: 4,
                                backgroundColor: "#000",
                              }),
                              option: (base, { isFocused, isSelected }) => ({
                                ...base,
                                backgroundColor: isSelected
                                  ? "var(--primary-600)"
                                  : isFocused
                                  ? "#222"
                                  : "#000",
                                color: "#fff",
                                cursor: "pointer",
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: "#fff",
                              }),
                              input: (base) => ({ ...base, color: "#fff" }),
                              placeholder: (base) => ({
                                ...base,
                                color: "#aaa",
                              }),
                            }}
                          />
                        </div>

                        {/* Status Dropdown */}
                        <div className="w-full">
                          <p className="text-white text-base leading-6 mb-2">
                            Status
                          </p>
                          <Select
                            value={statusDisplay}
                            onChange={(selected: any) =>
                              setFieldValue(
                                "status",
                                selected ? selected.id : ""
                              )
                            }
                            onBlur={() => setFieldTouched("status", true)}
                            getOptionLabel={(opt: any) => opt.name}
                            getOptionValue={(opt: any) => String(opt.id)}
                            options={status} // Pass the options for the Status dropdown
                            placeholder="Select Status"
                            isClearable
                            classNames={{
                              control: ({ isFocused }: any) =>
                                `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                                  isFocused
                                    ? "!border-primary-500"
                                    : "!border-gray-700"
                                }`,
                            }}
                            styles={{
                              menu: (base) => ({
                                ...base,
                                borderRadius: 4,
                                backgroundColor: "#000",
                              }),
                              option: (base, { isFocused, isSelected }) => ({
                                ...base,
                                backgroundColor: isSelected
                                  ? "var(--primary-600)"
                                  : isFocused
                                  ? "#222"
                                  : "#000",
                                color: "#fff",
                                cursor: "pointer",
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: "#fff",
                              }),
                              input: (base) => ({ ...base, color: "#fff" }),
                              placeholder: (base) => ({
                                ...base,
                                color: "#aaa",
                              }),
                            }}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                      >
                        Update Leads
                      </button>
                    </form>
                  );
                }}
              </Formik>
            </div>
          )}
          {isAgent && (
            <div className="w-full min-h-auto p-4  text-white">
              {/* Flyout header */}
              <div className="flex justify-between mb-4">
                <p className="text-primary-500 text-2xl font-bold leading-9">
                  Assign to Agent
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className="h-8 w-8 border border-white text-white rounded cursor-pointer"
                />
              </div>
              <div className="w-full border-b border-gray-700 mb-4"></div>

              {/* FORM */}
              <form onSubmit={handleSubmitAgent} className="w-full space-y-4">
                {/* Agent Dropdown */}
                <div className="w-full">
                  <p className="text-white text-base leading-6 mb-2">
                    Assign to Agent
                  </p>
                  <Select
                    value={selectedAgent}
                    onChange={(selected: any) => setSelectedAgent(selected)}
                    options={agentList}
                    getOptionLabel={(opt: Agent) => opt.name}
                    getOptionValue={(opt: Agent) => String(opt.id)}
                    placeholder="Select Agent"
                    isClearable
                    classNames={{
                      control: ({ isFocused }: any) =>
                        `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                          isFocused ? "!border-primary-500" : "!border-gray-700"
                        }`,
                    }}
                    styles={{
                      menu: (base) => ({
                        ...base,
                        borderRadius: 4,
                        backgroundColor: "#000",
                      }),
                      option: (base, { isFocused, isSelected }) => ({
                        ...base,
                        backgroundColor: isSelected
                          ? "var(--primary-600)"
                          : isFocused
                          ? "#222"
                          : "#000",
                        color: "#fff",
                        cursor: "pointer",
                      }),
                      singleValue: (base) => ({ ...base, color: "#fff" }),
                      input: (base) => ({ ...base, color: "#fff" }),
                      placeholder: (base) => ({ ...base, color: "#aaa" }),
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                >
                  Assign to Agent
                </button>
              </form>
            </div>
          )}
          {isAgentBulkCheckAssign && (
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  Assign to Agent
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className=" h-8 w-8 border border-[#E7E7E7]  rounded cursor-pointer"
                />
              </div>
              <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORM */}
              <form onSubmit={handleBulkAction} className="w-full space-y-4">
                {/* Agent Dropdown */}
                <div className="w-full">
                  <p className=" text-base leading-6 mb-2">Assign to Agent</p>
                  <Select
                    value={selectedAgent} // show selected agent
                    onChange={(selected: any) => setSelectedAgent(selected)}
                    options={agentList} // list from API
                    getOptionLabel={(opt: Agent) => opt.name} // show agent name
                    getOptionValue={(opt: Agent) => String(opt.id)} // use id as value
                    placeholder="Select Agent"
                    isClearable
                    classNames={{
                      control: ({ isFocused }: any) =>
                        `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                          isFocused ? "!border-primary-500" : "!border-gray-700"
                        }`,
                    }}
                    styles={{
                      menu: (base) => ({
                        ...base,
                        borderRadius: 4,
                        backgroundColor: "#000",
                      }),
                      option: (base, { isFocused, isSelected }) => ({
                        ...base,
                        backgroundColor: isSelected
                          ? "var(--primary-600)"
                          : isFocused
                          ? "#222"
                          : "#000",
                        color: "#fff",
                        cursor: "pointer",
                      }),
                      singleValue: (base) => ({ ...base, color: "#fff" }),
                      input: (base) => ({ ...base, color: "#fff" }),
                      placeholder: (base) => ({ ...base, color: "#aaa" }),
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                >
                  Assign to Agent Check Bulk
                </button>
              </form>
              {/* END FORM */}
            </div>
          )}
        </div>

        {/* <div className="absolute bottom-0 right-0">
          <Image
            src="/images/sideDesign.svg"
            alt="side desgin"
            width={100}
            height={100}
            className=" w-full h-full"
          />
        </div> */}
      </>

      {/* FITLER FLYOUT END */}
    </>
  );
}
