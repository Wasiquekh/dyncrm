"use client";
import Image from "next/image";
import Tabs from "../component/Tabs";
import { CiSettings } from "react-icons/ci";
import {
  IoIosCall,
  IoIosMail,
  IoIosNotificationsOutline,
  IoMdClose,
} from "react-icons/io";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FaCity,
  FaNotesMedical,
  FaRegEye,
  FaStar,
  FaTasks,
} from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import LeftSideBar from "../component/LeftSideBar";
import UserActivityLogger from "../../provider/UserActivityLogger";
import { MdEdit, MdLocationPin, MdVerified } from "react-icons/md";
import { TbActivity, TbTopologyStarRing2 } from "react-icons/tb";
import { PiMapPinLight, PiNotepadLight } from "react-icons/pi";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import AxiosProvider from "../../provider/AxiosProvider";
//import CustomerViewDetails from "../component/CustomerViewDetails";
import ReactPlayer from "react-player";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { AppContext } from "../AppContext";
import { GrPowerReset } from "react-icons/gr";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StorageManager from "../../provider/StorageManager";
import OtpInput from "react-otp-input";
import { FiFilter } from "react-icons/fi";
import { LuSquareActivity } from "react-icons/lu";
import { IoCloseOutline } from "react-icons/io5";
import AppCalendar, { TaskData } from "../component/AppCalendar";
import { useSearchParams } from "next/navigation";
import { AiOutlineSearch } from "react-icons/ai";
import { tasks } from "firebase-functions/v2";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  isValid as isValidDate,
  startOfToday,
  isToday,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
} from "date-fns";
import { compressIfImage } from "../component/imageCompression";
import Swal from "sweetalert2";
import { toZonedTime as utcToZonedTime, fromZonedTime as zonedTimeToUtc } from "date-fns-tz";
import { BiSkipNextCircle } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";



type TemplateOption = { id: string; title: string };
interface Lead {
  id: string;
  lead_number: string;
  first_name: string;
  last_name: string;
  full_name?: string; // optional because API may or may not return it
  email: string;
  phone: string;
  whatsapp_number?: string | null;

  address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };

  agent: {
    id: string | null;
    name: string | null;
  };

  best_time_to_call?: string | null;
  consolidated_credit_status?: string | null;
  debt_consolidation_status?: string | null;

  lead_quality: string;
  lead_score: number;
  lead_age_days: number;
  lead_age_label: string;

  lead_source?: string | null;
  owner_name?: string | null;

  created_at: string; // ISO string
  updated_at: string; // ISO string
  note:string;
}
interface LeadActivity {
  id: string;
  disposition: string;
  disposition_id: string;
  conversation: string;
  //occurred_at: string; // ISO date string
  agent_name: string;
  agent_id: string;
}
interface Disposition {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string | null; // can be null
}
interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
interface CreateLeadsActivityForm {
  conversation: string;
  createdAt: string; // optional
  disposition: string; // id
  agent: string; // optional id
}
interface LeadActivityData {
  id: string;
  disposition: string;
  disposition_id: string;
  conversation: string;
  occurred_at: string; // ISO date string
  created_at: string; // ISO date string
  agent_name: string;
  agent_id: string;
  created_at_ca: string;
  edited: boolean;
}
type UpdateLead = {
  id: string;
  first_name: string;
  last_name: string;
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
export interface LeadDocument {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  notes: string | null;
  is_image: boolean;
  download: string; // presigned url
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  created_at_ca: string;
  updated_at_ca: string;
  created_date_ca: string;
  updated_date_ca: string;
}
export interface ActivityHistory {
  id: string;
  agent_id: string;
  agent_name: string;
  disposition_id: string;
  disposition: string;
  conversation: string;
  occurred_at: string; // ISO datetime (e.g. "2025-09-13T18:30:00.000Z")
  created_at: string; // ISO datetime
}
const UPDATE_ACTIVITY_URL = "/leads/update/activity"; // <-- set your real update endpoint

type UpdateActivityPayload = {
  id: string;
  lead_id?: string;
  conversation?: string;
  occurred_at?: string;
  disposition_id?: string;
  agent_id?: string;
};
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
type CreateLead = {
  id: string;
  first_name: string;
  last_name: string;
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

const DISPO_AUTOFILL = new Set([
  "Blank Call",
  "Left A Voice Mail",
  "Voice Mail Full",
  "Voice Mail Not Set",
  "No Answer",
]);
const storage = new StorageManager();


export default function Home() {
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const checking = useAuthRedirect();


  const [isCustomerViewDetailOpen, setIsCustomerViewDetailOpen] =
    useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenVideo, setIsModalOpenVideo] = useState<boolean>(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [hitApi, setHitApi] = useState<boolean>(true);
  //console.log('BBBBBBBBBBBBB',isModalOpenVideo)
  const [modalImage, setModalImage] = useState<string>("");
  //const [isLoading, setIsLoading] = useState<boolean>(false);

  const [imageKey, setImageKey] = useState(Date.now());
  const [editInfo, setEditInfo] = useState<boolean>(true);
  const [secretKey, setSecretKey] = useState<string | null>(
    storage.getDecryptedUserSecretKey()
  );
  const searchParams = useSearchParams();
 const [leadId, setLeadId] = useState<string | undefined>(
  searchParams.get("id") ?? undefined
);

  // console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL", leadId);
  const [totp, setTotp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isTotpPopupOpen, setIsTotpPopupOpen] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [isSendTemplate, setIsSendtTemplate] = useState<boolean>(false)
  const [templateData, setTemplateData] = useState<string[]>([])
  console.log("++++++++++++++++++++++++++++++++++++++++",data)
    useEffect(() => {
      const fetchData = async () => {
        
        try {
          const response = await AxiosProvider.post("/gettemplate");
  
          // const result = response.data.data.data;
          //   console.log("888888888888888888", response.data.data);
          setTemplateData(response.data.data);
          // console.log(
          //   "888888888888888888",
          //   response.data.data.pagination.totalPages
          // );
          //  setTotalPages(response.data.data.pagination.totalPages);
          
        } catch (error: any) {
   
          console.error("Error fetching data:", error);
        } finally {
          closeFlyOut()
        }
      };
  
      fetchData();
    }, [hitApi]); // 👈 depends on `page`
useEffect(() => {
  if (data?.agent) {
    console.log("Agent ID:", data.agent.id);
    console.log("Agent Name:", data.agent.name);
  }
}, [data]);
   //console.log("LEAD SINGLE DATA", data.agent.name);
  const [leadActivityData, setLeadActivityData] = useState<LeadActivity>();
  const [disposition, setDisposition] = useState<Disposition[]>([]);
useEffect(() => {
  console.log("DISOSIOT NAME:", disposition);
}, [disposition]);

  const [agent, setAgent] = useState<Agent[]>([]);
    const [consolidationData, setConsolidationData] = useState<Consolidation[]>([]);
  const [debtConsolidation, setDebtConsolidation] = useState<DebtConsolidation[]>([]);
 
  const [activity, setActivity] = useState<boolean>(false);
  const [task, setTask] = useState<boolean>(false);
  const [document, setDocument] = useState<boolean>(false);
  const [updateAcitivityHistory, setUpdateActivityHistory] =
    useState<boolean>(false);
  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [fetchLeadActivityData, setFetchLeadaActivityData] = useState<
    LeadActivityData[]
  >([]);
  //console.log("fetched single lead data 111111111111111111", fetchLeadActivityData);
  const [reloadKey, setReloadKey] = useState(0);
  const [docs, setDocs] = useState<LeadDocument[]>([]); // start empty
  //console.log("DDDDDDDDDDDDOOOOOOOOOOOOOOCCCCCCCCSSSSSS",docs)
  const [activityHistoryData, setActivityHistoryData] =
    useState<ActivityHistory>(null);
  const [isEditFirstLead, setIsEditFirstLead] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedDropDownTaskValue, setSelectedDropDownTaskValue] =
    useState("");
  // console.log("VVVVVVVVVVVVVVVVVVVVVVVVVV", selectedDropDownTaskValue);
  const hiddenLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [isActivityFilter, setIsActvityFilter] = useState<boolean>(false);
  const [isTaskFilter, setIsTaskFilter] = useState<boolean>(false);
  const [isDocumentFilter, setIsDocumentFilter] = useState<boolean>(false);
  const [fileteredTaskData, setFilteredTasKData] = useState<[]>([]);
 // console.log("DDDDDDDDDDDDDDDDDDLLLLLLLLLLLLLLLL", fileteredTaskData);
 const [isleadPropertyEdit, setIsLeadPropertyEdit] = useState<boolean>(true)
 const [isDocumentEdit, setIsDocumentEdit] = useState<boolean>(false)
 const [documentEditObjectData, setDocumentEditObjectData] = useState<LeadDocument>(null);
 const [isTaskEdit, setIsTaskEdit] = useState<boolean>(false);
 const [taskEditObject, setTaskEditObject] = useState<any>(null);
 const [userRole,setUserRole] = useState(storage.getUserRole());
  const [isConversationExpanded, setIsConversationExpanded] = useState(false);
  const [isActivityHistoryPagination, setIsActivityHistoryPaination] = useState<boolean>(true)
  

// -----------NOTIFICATION-------------

// -----------END NOTIFICATION-------------

  //console.log("", documentName);
  // console.log("lead activity edit data", activityHistoryData);
  // console.log("lead activity",fetchLeadActivityData)
  //  FOR CREATE ACTIVITY LEAD
  // ✅ Validation
  const CreateTaskSchema = Yup.object({
    lead_id: Yup.string().trim().required("Lead is required."),
    assigned_agent_id: Yup.string().trim().required("Agent is required."),
    details: Yup.string()
      .trim()
      .min(3, "Details must be at least 3 characters.")
      .required("Details are required."),
    due_at_text: Yup.string().trim().required("Due date is required."),
  });
  const CreateLeadsActivitySchema = Yup.object({
    conversation: Yup.string()
      .required("Conversation is required"),
    createdAt: Yup.string().nullable(), // optional
    disposition_id: Yup.string().required("Disposition is required"),
    agent_id: Yup.string().required("Agent is required"), // optional
  });
  async function UpdateLeadsActivity(payload: UpdateActivityPayload) {
    console.log("UpdateLeadsActivity → payload:", payload);
    const res = await AxiosProvider.post(UPDATE_ACTIVITY_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    // console.log("UpdateLeadsActivity → response:", res.data);
    toast.success("Activity updated successfully");
    setHitApi(!hitApi);
    closeFlyOut();
    return res.data;
  }

const INITIAL_VALUES = {
  lead_id: leadId,
  conversation:  "",
  occurred_at: "",
  disposition_id: "",
  agent_id: userRole === "Agent" ? data?.agent?.id : "",
};

  const formInitialValues = activityHistoryData
    ? {
        id: activityHistoryData.id,
        lead_id: leadId,
        conversation: activityHistoryData.conversation ?? "",
        occurred_at: activityHistoryData.occurred_at ?? "",
        disposition_id: activityHistoryData.disposition_id ?? "",
        agent_id: activityHistoryData.agent_id ?? "",
      }
    : { id: "", ...INITIAL_VALUES };

  const InitialValuesForCreateTask = {
    lead_id: leadId, // required
    assigned_agent_id: "", // will hold agent id
    details: "", // task details
    subject: "", // new field
    task_type: "", // new field (e.g., followup, meeting, etc.)
    start_at_text: "", // new field (datetime string)
    end_at_text: "", // new field (datetime string)
    location: "", // required
    description: "", // optional
  };

  const CreateTaskActivity = async (n: typeof InitialValuesForCreateTask) => {
    const { description, ...rest } = n;
    const payload = {
      ...rest,
      lead_id: leadId, // ✅ now included
    };

    console.log("Submitted task values:", payload);

    try {
      await AxiosProvider.post("/leads/tasks/create", n);
      toast.success("Lead task is created");
      setHitApi(!hitApi);
      closeFlyOut();
    } catch (error: any) {
      toast.error("Lead task is not created");
    }
  };

  // ✅ Submit handler
  const CreateLeadsActivity = async (n: typeof INITIAL_VALUES) => {
    // console.log("Submitted values:", n);

    const { occurred_at, ...payload } = n; // removes occurred_at
    console.log("Payload without occurred_at:", payload);
    try {
      await AxiosProvider.post("/leads/activities/create", payload);
      toast.success("Lead activity is created");
      setHitApi(!hitApi);
      closeFlyOut();
    } catch (error: any) {
      toast.error("Lead activity is created");
    }
    // 👉 Replace with your API call
    // await AxiosProvider.post("/leads/activity/create", n);
  };
  //  END CREATE ACTIVITY LEAD
  const fetchData = async () => {
    if (!leadId) return;
    try {
      const res = await AxiosProvider.post("/leads/get", {
        lead_id: leadId,
      });

     // console.log("lead dataOOOOOOOOOOOOOOOOOOOO", res.data.data);
      setData(res.data.data); // <-- if you want to store in state
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [leadId, hitApi]);

  const fetchLeadActivity = async () => {
    if (!leadId) return;
    try {
      const res = await AxiosProvider.post(
        `/leads/activities/list?page=${page}&pageSize=${pageSize}`,
        {
          lead_id: leadId,
        }
      );

      //console.log("Lead Activity wwwwwwwwwwwwwwwwww", res.data.data.activities);
      console.log(
        "Lead Activity pagination",
        res.data.data.pagination.totalPages
      );
      setFetchLeadaActivityData(res.data.data.activities);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };
  useEffect(() => {
    fetchLeadActivity();
  }, [page, leadId, hitApi]);

  // NEXT LEADS FUNCTION
    const nextLeads = async () => {
  
    try {
      const res = await AxiosProvider.get("/leads/random",{
       
      });

      console.log("NEXT LEADS RESPONSE", res);
      setLeadId(res.data.data.id);
      
          //  window.open(`/leadsdetails?id=${res.data.data.id}`, "_blank", "noopener,noreferrer");
     // setData(res.data.data);
    } catch (error: any) {
      console.error("Error fetching lead:", error);
      toast.error(error)
    }
  };
  // FETCH DISPOSITION
  const fetchDisposition = async () => {
    try {
      const res = await AxiosProvider.get("/leads/dispositions/all");
      setDisposition(res.data.data.data);

      //console.log("fetch disposition", res.data.data.data);
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };
  useEffect(() => {
    fetchDisposition();
  }, []);
  // FETCH AGENT CONSILATION AND DEBT CONSILATION
  const fetchAgent = async () => {
    try {
      const res = await AxiosProvider.get("/allagents");
      //setDisposition(res.data.data.data);

      //console.log("fetch agent", res.data.data.data);
      setAgent(res.data.data.data);
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };
  useEffect(() => {
    fetchAgent();
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

    // END ETCH AGENT CONSILATION AND DEBT CONSILATION and lead source

    const openSendTemplateFlyout = ()=>{
      setFlyoutFilterOpen(true);
      setIsSendtTemplate(true)
    }
  const openActivityFlyout = () => {
    setFlyoutFilterOpen(true);
    setActivity(true);
  };
  const openTaskFlyout = () => {
    setFlyoutFilterOpen(true);
    setTask(true);
  };
  const openDocumentFlyout = () => {
    setFlyoutFilterOpen(true);
    setDocument(true);
  };
  const openLeadActivityFlyOut = () => {
    setFlyoutFilterOpen(true);
    setIsActvityFilter(true);
  };
  const openLeadTaskInFlyout = () => {
    setFlyoutFilterOpen(true);
    setIsTaskFilter(true);
  };
  const openLeadDocumentInFlyOut = () => {
    setFlyoutFilterOpen(true);
    setIsDocumentFilter(true);
  };
  const openActivityHistoryFlyout = (activity: ActivityHistory) => {
    setFlyoutFilterOpen(true);
    setUpdateActivityHistory(true);
    setActivityHistoryData(activity);
  };
  const openEditDocumentFlyOut = (d: LeadDocument)=>{
    setDocumentEditObjectData(d)
     setDocumentName(d.notes);
     setFlyoutFilterOpen(true);
    setIsDocumentEdit(true);
  }
  const openEditTask = (task: TaskData)=>{
    setTaskEditObject(task)
   
     setFlyoutFilterOpen(true);
     setIsTaskEdit(true);
  }
  const closeFlyOut = () => {
    setActivity(false);
    setTask(false);
    setFlyoutFilterOpen(false);
    setDocument(false);
    setUpdateActivityHistory(false);
    setIsActvityFilter(false);
    setIsTaskFilter(false);
    setIsDocumentFilter(false);
     setIsDocumentEdit(false);
     setIsTaskEdit(false);
     setIsSendtTemplate(false)
  };
  const handleChangepagination = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const UPLOAD_URL = "/leads/documents/upload"; // 👈 your final endpoint

  const handleSubmitDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!leadId) return;
    const userID = storage.getUserId();
    if (!userID) return;

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    // Compress only if it's an image
    const compressed = await compressIfImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.72,
      mimeType: "image/jpeg", // use "image/webp" if your backend supports it
      compressIfLargerThanBytes: 400 * 1024,
    });

    const fd = new FormData();
    fd.set("lead_id", String(leadId));
    fd.set("uploaded_by", String(userID));
    fd.set("file", compressed); // 👈 use the (maybe) compressed file
    fd.set("notes", documentName);

    try {
      await AxiosProvider.post(UPLOAD_URL, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        maxBodyLength: Infinity, // safe guard for large files
      });
      toast.success("Document uploaded successfully");
      closeFlyOut();
      setHitApi(!hitApi);
      setDocumentName("");
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    }
  };
  // ✅ Endpoint for update

// Optional: tiny helper so we only compress images
const isImageFile = (f?: File | null) => !!f && f.type?.startsWith("image/");
const UPDATE_URL = "/leads/document/edit";

const handleUpdateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!documentEditObjectData?.id) {
    toast.error("No document selected to update.");
    return;
  }
  if (!leadId) return;
  const userID = storage.getUserId();
  if (!userID) return;

  const form = e.currentTarget;
  const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
  const file = fileInput?.files?.[0] ?? null;

  const fd = new FormData();
  fd.set("document_id", String(documentEditObjectData.id)); // 👈 correct key
  fd.set("lead_id", String(leadId));
  fd.set("uploaded_by", String(userID));
  fd.set("notes", documentName);

  if (file) {
    const compressed = file.type.startsWith("image/")
      ? await compressIfImage(file, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.72,
          mimeType: "image/jpeg",
          compressIfLargerThanBytes: 400 * 1024,
        })
      : file;
    fd.set("file", compressed);
  }

  try {
    await AxiosProvider.post(UPDATE_URL, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      maxBodyLength: Infinity,
    });
    toast.success("Document updated successfully");
    closeFlyOut();
    setHitApi(!hitApi);
    setDocumentName("");
    form.reset();
  } catch (err) {
    console.error(err);
    toast.error("Update failed. Please try again.");
  }
};


  const fetchLeadDocumentData = async () => {
    if (!leadId) return;
    try {
      const res = await AxiosProvider.post("/leads/documents/list", {
        lead_id: leadId,
      });

   console.log("lead document data22222222222", res.data.data.data);
      setDocs(res.data.data.data); // <-- if you want to store in state
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };

  useEffect(() => {
    fetchLeadDocumentData();
  }, [leadId, hitApi]);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""; // if storage_path is relative
  const url = (p: string) => (p?.startsWith("http") ? p : `${baseUrl}${p}`);
  const fmtSize = (b: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0,
      n = b;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(1)} ${units[i]}`;
  };
  const fileExt = (name: string) =>
    (name?.split(".").pop() || "").toUpperCase();
// ----------------- DOWNLOAD IMAGE

const downloadDocument = (src: string | Blob, fileName = "image.jpg") => {
  if (typeof src === "string") {
    // case 1: URL string
    const a = window.document.createElement("a");
    a.href = src;
    a.download = fileName;
    window.document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    // case 2: Blob object
    const url = URL.createObjectURL(src);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = fileName;
    window.document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
};
// -----------------------END DOWNLOAD IMAGE


  const deleteActivityHistory = async (deleteId: ActivityHistory) => {
    const activityHistoryId = deleteId.id;
    console.log("ACTIVITY HISTORY DELETE ID", activityHistoryId);
    //return;
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this activity?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AxiosProvider.post("/leads/activities/soft-delete", {
            id: activityHistoryId,
          });

          toast.success("Successfully Deleted");
          setHitApi(!hitApi);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };
  const deleteDocument = async (deleteId: LeadDocument) => {
    const documentId = deleteId.id;
    console.log("ACTIVITY HISTORY DELETE ID", documentId);
    //return;
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AxiosProvider.post("/leads/documents/soft-delete", {
            id: deleteId.id,
          });

          toast.success("Successfully Deleted");
          setHitApi(!hitApi);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };
  const handleSelect = (item: string) => {
    setSelectedDropDownTaskValue(item); // save value in state
    openTaskFlyout(); // your existing function
  };
    const provinceOptions = [
  { id: "alberta", name: "Alberta" },
  { id: "british-columbia", name: "British Columbia" },
  { id: "manitoba", name: "Manitoba" },
  { id: "new-brunswick", name: "New Brunswick" },
  { id: "newfoundland-labrador", name: "Newfoundland and Labrador" },
  { id: "northwest-territories", name: "Northwest Territories" },
  { id: "nova-scotia", name: "Nova Scotia" },
  { id: "nunavut", name: "Nunavut" },
  { id: "ontario", name: "Ontario" },
  { id: "prince-edward-island", name: "Prince Edward Island" },
  { id: "quebec", name: "Quebec" },
  { id: "saskatchewan", name: "Saskatchewan" },
  { id: "yukon", name: "Yukon" },
];
  const maxLength = 100; // Set your desired maximum length

  // Function to handle Show More/Show Less toggle
  const toggleConversationExpansion = () => {
    setIsConversationExpanded(!isConversationExpanded);
  };
  useEffect(()=>{
setIsActivityHistoryPaination(true)
  },[hitApi])
  

  const tabs = [
    {
      label: "Activity History",
      content: (
        <>
          {/* Tab content 3 */}
          <div className="container mx-auto p-4">
            <button
              onClick={() => openLeadActivityFlyOut()}
              className="bg-primary-600 hover:bg-primary-700 py-3 px-4 rounded-[4px] text-sm font-medium text-white mb-2"
            >
              Filter Activity
            </button>

            {fetchLeadActivityData && fetchLeadActivityData.length > 0 ? (
              fetchLeadActivityData.map((activity) => {
                const formattedOccurredCa = activity.created_at_ca || "--";

                return (
                  <div
                    key={activity.id}
                    className="w-full flex justify-between gap-4 hover:bg-primary-800 py-2 px-2 rounded transition-colors border-b border-[#E7E7E7] odd:bg-[#404040]"
                  >
                    {/* Left: icon + occurred date/time */}
                    <div className="flex gap-2 shrink-0">
                      <TbActivity className="bg-primary-500 text-white p-1 text-2xl rounded-full" />
                      <div className="leading-5 text-sm text-white">
                        <p>{formattedOccurredCa}</p>
                      </div>
                    </div>

                    {/* Middle: details */}
                    <div className="flex-1 min-w-0 text-white">
                      <p>
                        <span className="text-primary-300">
                          {activity.disposition}:
                        </span>{" "}
                        {activity.conversation.length > maxLength &&
                        !isConversationExpanded
                          ? activity.conversation.substring(0, maxLength) +
                            "..."
                          : activity.conversation}
                      </p>
                      {activity.conversation.length > maxLength && (
                        <button
                          onClick={toggleConversationExpansion}
                          className="text-primary-300 underline text-sm"
                        >
                          {isConversationExpanded ? "Show less" : "Show more"}
                        </button>
                      )}

                      <p className="text-xs text-gray-400">
                        Added by {activity.agent_name} on {formattedOccurredCa}{" "}
                        {activity.edited ? "(Edited)" : ""}
                      </p>
                    </div>

                    {/* Right: Action buttons */}
                    <div className="space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openActivityHistoryFlyout(activity)}
                        className="py-1.5 px-3 rounded text-sm bg-primary-500 text-white hover:bg-primary-600"
                      >
                        {/* Edit */}
                        <MdEdit />
                      </button>
                      {userRole === "Admin" && (
                        <button
                          type="button"
                          onClick={() => deleteActivityHistory(activity)}
                          className="py-1.5 px-3 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          {/* Delete */}
                          <RiDeleteBin6Line />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400 py-4">No data found</p>
            )}

            {/* PAGINATION */}
            {isActivityHistoryPagination &&
              (fetchLeadActivityData.length > 0 && (
                <div className="flex justify-center items-center my-10 relative">
                  <button
                    onClick={() => handleChangepagination(page - 1)}
                    disabled={page === 1}
                    className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiChevronDoubleLeft className="w-6 h-auto" />
                  </button>
                  <span className="text-gray-400 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handleChangepagination(page + 1)}
                    disabled={page === totalPages}
                    className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiChevronDoubleRight className="w-6 h-auto" />
                  </button>
                </div>
              ))}
            {/* END PAGINATION */}
          </div>
        </>
      ),
      // End Tab content 2
    },
    {
      label: "Task",
      content: (
        <>
          {/* Tab content 3 */}

          <AppCalendar
            leadId={leadId}
            reloadKey={reloadKey}
            hitApi={hitApi}
            setHitApi={setHitApi}
            openEditTask={openEditTask}
            openLeadTaskInFlyout={openLeadTaskInFlyout}
            incomingTasks={fileteredTaskData}
            //filteredTaskData={fileteredTaskData}
          />
          {/* End Tab content 3 */}
        </>
      ),
    },
    {
      label: "Document",
      content: (
        <>
          {/* Tab content 4 */}
          <div className="space-y-3">
            {docs.length === 0 ? (
              <p className="text-sm text-gray-400">No documents found</p>
            ) : (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-[30%_1fr] gap-4  p-3 border border-white rounded hover:bg-primary-600 transition-colors"
                >
                  {/* Left Column: Notes */}
                  <div className="flex items-center">
                    <p className="text-base text-white whitespace-pre-wrap capitalize">
                      {d.notes || "—"}
                    </p>
                  </div>

                  {/* Right Column: File Info + Buttons */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">
                        {d.file_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {d.mime_type} · {fmtSize(d.file_size)} ·{" "}
                        {new Date(d.created_at_ca).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
                      <a
                        href={d.download}
                        download
                        className="py-2 px-3 border border-gray-600 rounded text-sm text-white hover:bg-primary-500 hover:text-white transition-colors"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => openEditDocumentFlyOut(d)}
                        className="py-2 px-3 border border-gray-600 rounded text-sm text-white hover:bg-primary-500 hover:text-white transition-colors"
                      >
                        {/* Edit */}
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => deleteDocument(d)}
                        className="py-2 px-3 border border-red-500 rounded text-sm text-white hover:bg-red-600 hover:text-white transition-colors"
                      >
                        {/* Delete */}
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* End Tab content 4 */}
        </>
      ),
    },
  ];
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
  const handleSubmit = async () => {};

  // --------------------------- DATE HELPER

  // Timezone (Eastern with DST)
  const CA_TZ = "America/Toronto";

  // Window + slot config
  const WORK_START_HOUR = 10; // 10:00
  const WORK_END_HOUR = 21; // 21:00 (latest selectable "From")
  const SLOT_MINUTES = 15; // time-step shown in picker
  const DURATION_MINUTES = 30; // length of scheduled slot

  // UTC -> Canada local (for showing)
  const toPickerLocal = (d: Date | null) =>
    d ? utcToZonedTime(d, CA_TZ) : null;

  // Canada local -> UTC (for storing/state)
  const fromPickerLocal = (d: Date | null) =>
    d ? zonedTimeToUtc(d, CA_TZ) : null;

  // "Now" in Canada tz
  const nowCA = () => utcToZonedTime(new Date(), CA_TZ);

  // Round UP to next SLOT_MINUTES (Canada time)
  const roundUpToSlot = (d: Date = nowCA()) => {
    const copy = new Date(d);
    copy.setSeconds(0, 0);
    const mins = copy.getMinutes();
    const add = (SLOT_MINUTES - (mins % SLOT_MINUTES)) % SLOT_MINUTES;
    copy.setMinutes(mins + add);
    return copy;
  };

  // Add minutes
  const addMinutes = (d: Date, mins: number) => {
    const copy = new Date(d);
    copy.setMinutes(copy.getMinutes() + mins);
    return copy;
  };

  // Same-day check in Canada tz
  const isSameDay = (a?: Date | null, b?: Date | null) => {
    if (!a || !b) return false;
    const za = utcToZonedTime(a, CA_TZ);
    const zb = utcToZonedTime(b, CA_TZ);
    return (
      za.getFullYear() === zb.getFullYear() &&
      za.getMonth() === zb.getMonth() &&
      za.getDate() === zb.getDate()
    );
  };

  // Start of today (Canada tz) for minDate
  const startOfTodayCA = () => {
    const n = nowCA();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };

  // Build a time on the same calendar day (Canada local)
  const atHM = (baseCA: Date, hour: number, minute = 0) =>
    new Date(
      baseCA.getFullYear(),
      baseCA.getMonth(),
      baseCA.getDate(),
      hour,
      minute,
      0,
      0
    );

  // Daily bounds (Canada local)
  const windowStartCA = (dCA: Date) => atHM(dCA, WORK_START_HOUR, 0); // 10:00
  const windowEndCA = (dCA: Date) => atHM(dCA, WORK_END_HOUR, 0); // 21:00

  // Next valid START within window (for defaults and today's earliest)
  // Allows picking up to 21:00; if "now" >= 21:00, move to tomorrow 10:00
  const nextValidStartInWindowCA = (base: Date = nowCA()) => {
    const today = new Date(base);
    const wStart = windowStartCA(today);
    const wEnd = windowEndCA(today);

    if (base < wStart) return wStart; // before 10:00 -> 10:00
    if (base >= wEnd) {
      const tomorrow = addMinutes(atHM(today, 0), 24 * 60);
      return windowStartCA(tomorrow);
    }
    const rounded = roundUpToSlot(base);
    return rounded > wEnd ? wEnd : rounded;
  };

  // Formatter for payload (Canada local)
  const formatDateTime = (d: Date) => {
    const z = utcToZonedTime(d, CA_TZ);
    const pad = (n: number) => String(n).padStart(2, "0");
    let h = z.getHours();
    const m = pad(z.getMinutes());
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    const yyyy = z.getFullYear();
    const mm = pad(z.getMonth() + 1);
    const dd = pad(z.getDate());
    return `${mm}-${dd}-${yyyy} ${pad(h)}:${m}${ampm}`;
  };

  // ---------- Defaults for Formik initialValues (store UTC) ----------
  const defaultStartCA = nextValidStartInWindowCA();
  const defaultStart = fromPickerLocal(defaultStartCA)!;
  const defaultEnd = addMinutes(defaultStart, DURATION_MINUTES);

  // --------- END DATE HELPER ------------

  // helpers (put inside the component)
  const findById = (list: any[], id: string | number) =>
    list?.find((o: any) => String(o.id) === String(id)) || null;

  const getIdFromName = (list: any[], name?: string | null) => {
    if (!name) return "";
    const item = list?.find((o: any) => String(o.name) === String(name));
    return item ? item.id : "";
  };

  function setFieldTouched(arg0: string, arg1: boolean): void {
    throw new Error("Function not implemented.");
  }

  function setFieldValue(arg0: string, arg1: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <div className="ml-[97px]  w-full md:w-[90%] m-auto  min-h-[500px]  rounded p-4 mt-0 ">
          <LeftSideBar />
          {/* left section top row */}
          <DesktopHeader />
          {/* right section top row */}
          {/* </div> */}
          <div className=" w-full    flex justify-center relative">
            <div className="w-full md:w-full min-h-[600px]  !rounded-3xl  mainContainerBg">
              <div className="py-4 px-2 md:p-6">
                {/* Buttons */}

                <div className="flex justify-end items-center mb-6 w-full gap-2">
                  <div className="flex justify-center items-center gap-4 ">
                    <div
                      className="flex gap-2 py-3 px-0 justify-center rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-800 group min-w-40"
                      onClick={() => openSendTemplateFlyout()}
                    >
                      <LuSquareActivity className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Send Email
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4 ">
                    <div
                      className="flex gap-2 py-3 px-0 justify-center rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-800 group min-w-32"
                      onClick={() => openActivityFlyout()}
                    >
                      <LuSquareActivity className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Activity
                      </p>
                    </div>
                  </div>
                  {/* TASK */}
                  <div className="flex justify-center items-center gap-4">
                    <div className="relative group">
                      {/* Main Button */}
                      <div
                        className="flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-800 min-w-32"
                        // onClick={() => openTaskFlyout()}
                        onClick={() => handleSelect("meeting")}
                      >
                        <FaNotesMedical className="w-5 h-5 text-white" />
                        <p className="text-white text-base font-medium">Task</p>
                      </div>

                      {/* Dropdown */}
                      {/* <div className="absolute left-0 mt-2 w-40 rounded-[4px] border border-[#E7E7E7] bg-white shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <ul className="flex flex-col">
                          {["meeting", "followup", "phonecall"].map((item) => (
                            <li
                              key={item}
                              onClick={() => handleSelect(item)}
                              className="px-4 py-2 text-gray-700 hover:bg-primary-100 hover:text-primary-700 cursor-pointer text-sm capitalize"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div> */}
                    </div>
                  </div>

                  {/* END TASK */}
                  <div className="flex justify-center items-center gap-4">
                    <div
                      className="flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-700 active:bg-primary-800 group min-w-32"
                      onClick={() => openDocumentFlyout()}
                    >
                      <FaTasks className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Document
                      </p>
                    </div>
                  </div>
                </div>
                <div className=" grid grid-cols-[30%_70%]  gap-4">
                  <div className="  w-full">
                    {/* LEAD */}
                    {isEditFirstLead ? (
                      /* ---------- VIEW MODE (unchanged) ---------- */
                      <div className="w-full rounded bg-primary-600 px-4 py-6 mb-6">
                        <div className=" flex justify-between text-white  mb-5 capitalize">
                          <div className=" flex gap-2">
                            <FaStar />
                            <div>
                              <p className=" text-base font-medium leading-none">
                                {data?.full_name || "-"}
                              </p>
                              {/* <p>{data?.address?.country || "-"}</p> */}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditFirstLead(false)} // flip state
                            className="px-4 py-2 rounded-[4px] bg-white text-secondBlack text-sm font-medium flex gap-1 items-center"
                          >
                            <span>
                              <MdEdit />
                            </span>
                            {/* Edit */}
                          </button>
                        </div>

                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <IoIosMail />
                          <p className=" text-sm font-medium leading-none">
                            {data?.email || "-"}
                          </p>
                        </div>

                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <IoIosCall />
                          <p className=" text-sm font-medium leading-none">
                            {data?.phone || "-"}
                          </p>
                        </div>

                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <MdLocationPin />
                          <p className=" text-sm font-medium leading-none">
                            {data?.address?.line1 || "-"}{" "}
                            {/* {data?.address?.line2 || "-"}{" "} */}
                            {/* {data?.address?.city || "-"}{" "} */}
                            {data?.address?.state || "-"}
                          </p>
                        </div>

                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <FaCity />
                          <p className=" text-sm font-medium leading-none">
                            {data?.address?.postal_code || "-"}
                          </p>
                        </div>

                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <p className="text-sm font-medium leading-none">
                            Province:
                          </p>
                          <p className=" text-sm font-medium leading-none">
                            {data?.address?.state || "-"}
                          </p>
                        </div>
                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <p className="text-sm font-medium leading-none">
                            Note:
                          </p>
                          <p className=" text-sm font-medium leading-none">
                            {data?.note || "-"}
                          </p>
                        </div>

                        {/* ✅ Edit button */}
                        <div className="flex justify-end pt-4"></div>
                      </div>
                    ) : (
                      /* ---------- EDIT MODE (Formik form) ---------- */
                      /* ---------- EDIT MODE (Formik form) ---------- */
                      <div className="w-full rounded  px-0 py-0 mb-6">
                        <Formik
                          enableReinitialize
                          initialValues={{
                            full_name: data?.full_name ?? "",
                            country: data?.address?.country ?? "",
                            email: data?.email ?? "",
                            phone: data?.phone ?? "",
                            address_line1: data?.address?.line1 ?? "",
                            address_line2: data?.address?.line2 ?? "",
                            city: data?.address?.city ?? "",
                            state: data?.address?.state ?? "",
                            note: data?.note ?? "", // ✅ Added note
                          }}
                          validationSchema={Yup.object({
                            full_name: Yup.string()
                              .trim()
                              .required("Full name is required"),
                            email: Yup.string()
                              .trim()
                              .email("Invalid email")
                              .required("Email is required"),
                            phone: Yup.string()
                              .trim()
                              .required("Mobile is required"),
                            country: Yup.string().trim().nullable(),
                            address_line1: Yup.string().trim().nullable(),
                            address_line2: Yup.string().trim().nullable(),
                            city: Yup.string().trim().nullable(),
                            state: Yup.string().trim().nullable(),
                            note: Yup.string().trim().nullable(), // ✅ Optional note
                          })}
                          onSubmit={async (values, { setSubmitting }) => {
                            try {
                              const payload = {
                                id: data?.id,
                                ...values, // ✅ includes note
                              };
                              //console.log("PPPPPPPPPPPPPPPPP",payload)
                              //return;
                              await AxiosProvider.post(
                                "/leads/update",
                                payload
                              );
                              toast.success("Lead updated successfully");
                              setIsEditFirstLead(true);
                              setHitApi(!hitApi);
                            } catch (e) {
                              console.error(e);
                              toast.error("Failed to update lead");
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                        >
                          {({
                            isSubmitting,
                            values,
                            setFieldValue,
                            setFieldTouched,
                          }) => (
                            <Form className="w-full rounded bg-primary-600 px-4 py-6 mb-6 ">
                              {/* Name row */}
                              <div className="grid grid-cols-1  text-white">
                                <div>
                                  <label className="block text-sm font-medium text-white mb-1">
                                    Full Name{" "}
                                    <span className=" text-red-400">*</span>
                                  </label>
                                  <Field
                                    name="full_name"
                                    type="text"
                                    className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent mb-2 placeholder-white placeholder:opacity-[0.9]"
                                    placeholder="Enter first name"
                                  />
                                  <ErrorMessage
                                    name="full_name"
                                    component="p"
                                    className="text-red-500 text-xs mt-1"
                                  />
                                </div>
                              </div>

                              {/* Email / Phone */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-white mb-1">
                                    Email{" "}
                                    <span className=" text-red-400">*</span>
                                  </label>
                                  <Field
                                    name="email"
                                    type="email"
                                    className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent text-white mb-2 placeholder-white placeholder:opacity-[0.9]"
                                    placeholder="name@example.com"
                                  />
                                  <ErrorMessage
                                    name="email"
                                    component="p"
                                    className="text-red-500 text-xs mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-white mb-1">
                                    Mobile{" "}
                                    <span className=" text-red-400">*</span>
                                  </label>
                                  <Field
                                    name="phone"
                                    type="text"
                                    className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent text-white mb-2 placeholder-white placeholder:opacity-[0.9]"
                                    placeholder="Enter mobile number"
                                  />
                                  <ErrorMessage
                                    name="phone"
                                    component="p"
                                    className="text-red-500 text-xs mt-1"
                                  />
                                </div>
                              </div>

                              {/* Country */}
                              {/* <div>
          <label className="block text-sm font-medium text-white mb-1">
            Country
          </label>
          <Field
            name="country"
            type="text"
            className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent text-white mb-2 placeholder-white placeholder:opacity-[0.9]"
            placeholder="Country"
          />
          <ErrorMessage
            name="country"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div> */}

                              {/* Address lines */}
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Address Line 1
                                </label>
                                <Field
                                  name="address_line1"
                                  type="text"
                                  className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent text-white mb-2"
                                  placeholder="House / Street / Area"
                                />
                                <ErrorMessage
                                  name="address_line1"
                                  component="p"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                              {/* <div>
          <label className="block text-sm font-medium text-white mb-1">
            Address Line 2
          </label>
          <Field
            name="address_line2"
            type="text"
            className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent text-white mb-2"
            placeholder="Landmark / Apartment"
          />
          <ErrorMessage
            name="address_line2"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div> */}

                              {/* City / State */}
                              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                {/* <div>
    <label className="block text-sm font-medium text-white mb-1">City</label>
    <Field
      name="city"
      type="text"
      className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent text-white mb-2 placeholder-white placeholder:opacity-[0.9]"
      placeholder="City"
    />
    <ErrorMessage name="city" component="p" className="text-red-500 text-xs mt-1" />
  </div> */}

                                {/* Province (stored in backend as "state") */}
                              {/* Province / State (Text Input) */}
<div>
  <label className="block text-sm font-medium text-white mb-1">
    Province / State
  </label>
  <Field
    name="state"
    type="text"
    className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 
               focus:outline-none bg-transparent text-white mb-2 placeholder-white 
               placeholder:opacity-[0.9]"
    placeholder="Enter province/state"
  />
  <ErrorMessage
    name="state"
    component="p"
    className="text-red-500 text-xs mt-1"
  />
</div>

                              </div>

                              {/* ✅ Note field */}
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Note
                                </label>
                                <Field
                                  as="textarea"
                                  name="note"
                                  rows={3}
                                  className="w-full border-b border-white pl-0.5 text-sm leading-6 px-0 py-0 focus:outline-none bg-transparent text-white mb-2 placeholder-white placeholder:opacity-[0.9]"
                                  placeholder="Enter notes here"
                                />
                                <ErrorMessage
                                  name="note"
                                  component="p"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                  type="button"
                                  onClick={() => setIsEditFirstLead(true)}
                                  className="px-4 py-2 rounded-[4px] border border-[#DFEAF2] text-secondBlack text-sm font-medium bg-white mb-2"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="px-4 py-2 rounded-[4px] border border-[#DFEAF2] text-secondBlack text-sm font-medium bg-white mb-2 disabled:opacity-60"
                                >
                                  {isSubmitting ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      </div>
                    )}

                    {/* LEAD PROPERTIES */}
                    {isleadPropertyEdit ? (
                      <div className="w-full border border-white rounded overflow-hidden">
                        <table className="w-full text-sm text-left text-white">
                          <thead className="text-xs ">
                            <tr className="border talbleheaderBg">
                              <th
                                scope="col"
                                colSpan={2}
                                className="px-3 py-3 md:p-3 border border-gray-700 font-semibold text-white text-base"
                              >
                                <div className="flex justify-between items-center">
                                  <span>Lead Properties</span>
                                  <span
                                    className="flex gap-1 items-center px-4 py-2 rounded-[4px] bg-primary-600 text-white text-sm font-medium cursor-pointer disabled:opacity-60"
                                    onClick={() =>
                                      setIsLeadPropertyEdit(!isleadPropertyEdit)
                                    }
                                  >
                                    <span>
                                      <MdEdit />
                                    </span>
                                    {/* Edit */}
                                  </span>
                                </div>
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {[
                              {
                                label: "Lead Number",
                                value: data?.lead_number,
                              },
                              { label: "Agent Name", value: data?.agent.name },
                              {
                                label: "Best time to call",
                                value: data?.best_time_to_call,
                              },
                              {
                                label: "Lead Source",
                                value: data?.lead_source,
                              },
        
                              {
                                label: "WHATSAPP",
                                value: data?.whatsapp_number,
                              },
                              ...(userRole === "Admin"
                                ? [
                                    {
                                      label: "Lead Age",
                                      value: data?.lead_age_days,
                                    },
                                  ]
                                : []),
                            ].map((row, idx) => (
                              <tr
                                key={idx}
                                className="border    transition-colors border-b border-[#E7E7E7] odd:bg-[#404040]"
                              >
                                <td className="text-sm text-gray-400 py-4 px-4">
                                  {row.label}
                                </td>
                                <td className="text-sm font-medium text-white py-4 px-4">
                                  {row.value || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      // LEAD PROPERTIES EDIT FORM
                      <>
                        <div className="w-full">
                          <Formik
                            enableReinitialize
                            initialValues={{
                              id: leadId,
                              agent_id: data?.agent?.id ?? "",
                              debt_consolidation_status_id:
                                data?.debt_consolidation_status_id ??
                                getIdFromName(
                                  debtConsolidation,
                                  data?.debt_consolidation_status
                                ) ??
                                "",
                              consolidated_credit_status_id:
                                data?.consolidated_credit_status_id ??
                                getIdFromName(
                                  consolidationData,
                                  data?.consolidated_credit_status
                                ) ??
                                "",
                              best_time_to_call: data?.best_time_to_call ?? "",
                              whatsapp_number: data?.whatsapp_number ?? "",
                            }}
                            validationSchema={Yup.object({
                              agent_id: Yup.string().nullable(),
                              debt_consolidation_status_id:
                                Yup.string().nullable(),
                              consolidated_credit_status_id:
                                Yup.string().nullable(),
                              best_time_to_call: Yup.string().trim().nullable(),
                              whatsapp_number: Yup.string().trim().nullable(),
                            })}
                            onSubmit={async (values) => {
                              try {
                                await AxiosProvider.post(
                                  "/leads/update",
                                  values
                                );
                                toast.success("Lead is Updated");
                                setHitApi(!hitApi);
                                setIsLeadPropertyEdit(!isleadPropertyEdit);
                              } catch (error: any) {
                                toast.error("Lead is not Updated");
                              }
                            }}
                          >
                            {({
                              setFieldValue,
                              setFieldTouched,
                              values,
                              isSubmitting,
                            }) => {
                              const findById = (
                                list: any[],
                                id: string | number
                              ) =>
                                list?.find(
                                  (o: any) => String(o.id) === String(id)
                                ) || null;

                              const agentValue = findById(
                                agent,
                                values.agent_id
                              );
                              const debtConsValue = findById(
                                debtConsolidation,
                                values.debt_consolidation_status_id
                              );
                              const consValue = findById(
                                consolidationData,
                                values.consolidated_credit_status_id
                              );

                              return (
                                <Form>
                                  <table className="w-full text-sm text-left  text-white">
                                    <thead className="text-xs bg-primary-500 text-white">
                                      <tr className="border border-tableBorder">
                                        <th
                                          scope="col"
                                          className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-white text-base"
                                          colSpan={2}
                                        >
                                          Lead Properties (Edit)
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {/* Agent -> Dropdown */}
                                      <tr className="border border-tableBorder  hover:bg-primary-600 transition-colors">
                                        <td className="text-sm text-[#FFD700] py-4 px-4">
                                          Agent Name
                                        </td>
                                        <td className="py-4 px-4">
                                          <Select
                                            value={agentValue}
                                            onChange={(selected: any) =>
                                              setFieldValue(
                                                "agent_id",
                                                selected ? selected.id : ""
                                              )
                                            }
                                            onBlur={() =>
                                              setFieldTouched("agent_id", true)
                                            }
                                            getOptionLabel={(opt: any) =>
                                              opt.name
                                            }
                                            getOptionValue={(opt: any) =>
                                              String(opt.id)
                                            }
                                            options={agent}
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
                                              option: (
                                                base,
                                                { isFocused, isSelected }
                                              ) => ({
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
                                              input: (base) => ({
                                                ...base,
                                                color: "#fff",
                                              }),
                                              placeholder: (base) => ({
                                                ...base,
                                                color: "#aaa",
                                              }),
                                            }}
                                          />
                                        </td>
                                      </tr>

                                      {/* Best time to call -> Input */}
                                      <tr className="border border-tableBorder  hover:bg-primary-600 transition-colors">
                                        <td className="text-sm text-[#FFD700] py-4 px-4">
                                          Best time to call
                                        </td>
                                        <td className="py-4 px-4">
                                          <Field
                                            name="best_time_to_call"
                                            type="text"
                                            className="w-full border border-primary-500 rounded-[4px] text-white bg-black text-sm px-3 py-2 focus:outline-none"
                                            placeholder="Enter best time to call"
                                          />
                                          <ErrorMessage
                                            name="best_time_to_call"
                                            component="p"
                                            className="text-red-500 text-xs mt-1"
                                          />
                                        </td>
                                      </tr>

                                      {/* WhatsApp -> Input */}
                                      <tr className="border border-tableBorder  hover:bg-primary-600 transition-colors">
                                        <td className="text-sm text-[#FFD700] py-4 px-4">
                                          WHATSAPP
                                        </td>
                                        <td className="py-4 px-4">
                                          <Field
                                            name="whatsapp_number"
                                            type="text"
                                            className="w-full border border-primary-500 rounded-[4px] text-white bg-black text-sm px-3 py-2 focus:outline-none"
                                            placeholder="Enter WhatsApp number"
                                          />
                                          <ErrorMessage
                                            name="whatsapp_number"
                                            component="p"
                                            className="text-red-500 text-xs mt-1"
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  {/* Buttons */}
                                  <div className="flex items-center justify-end gap-3 pt-4">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setIsLeadPropertyEdit(
                                          !isleadPropertyEdit
                                        )
                                      }
                                      className="px-4 py-2 rounded-[4px] border border-primary-500 text-white text-sm font-medium bg-black"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={isSubmitting}
                                      className="px-4 py-2 rounded-[4px] bg-primary-600 text-white text-sm font-medium disabled:opacity-60"
                                    >
                                      {isSubmitting ? "Saving..." : "Save"}
                                    </button>
                                  </div>
                                </Form>
                              );
                            }}
                          </Formik>
                        </div>
                      </>
                    )}
                  </div>
                  <div className=" md:flex relative w-full">
                    <Tabs tabs={tabs} />
                    <GrPowerReset
                      onClick={() => setHitApi(!hitApi)}
                      className=" absolute -top-5 -right-1 md:top-2 md:right-1 cursor-pointer text-lg md:text-2xl text-white hover:text-primary-500 active:text-primary-600"
                    />
                  </div>
                </div>
                {userRole === "Agent" && (
                  <>
                    <div className="w-full flex justify-center border-b border-gray-200 mb-4"></div>
                    <div className="w-full flex justify-center ">
                      <div
                        onClick={() => nextLeads()}
                        className="flex w-auto gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700  "
                      >
                        <p className="text-white text-base font-medium">
                          Next Leads
                        </p>
                        <BiSkipNextCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <CustomerViewDetails
        isCustomerViewDetailOpen={isCustomerViewDetailOpen}
        setIsEditFlyoutOpen={setIsCustomerViewDetailOpen}
        customer={customer}
        selectedButton={selectedButton}
        setFaceImageFromChild={setFaceImageFromChild}
        setIdEctoFromChild={setIdEctoFromChild}
        setIdVersoFromChild={setIdVersoFromChild}
        setUserSignatureFromChild={setUserSignatureFromChild}
        setUserVideoFromChild={setUserVideoFromChild}
        hitApi={hitApi}
        setHitApi={setHitApi}
      /> */}
      {/* START FLY OUT */}
      {/* FITLER FLYOUT */}
      {isFlyoutFilterOpen && (
        <div
          className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => {
            closeFlyOut();
          }}
        ></div>
      )}

      <div className={`filterflyout ${isFlyoutFilterOpen ? "filteropen" : ""}`}>
        {activity && (
          <div className="w-full min-h-auto  text-white p-4">
            {/* Flyout Header */}
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Create Lead Activity
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            {/* FORM */}
            <Formik
              initialValues={INITIAL_VALUES}
              validationSchema={CreateLeadsActivitySchema}
              onSubmit={async (values, { setSubmitting }) => {
                await CreateLeadsActivity(values);
                setReloadKey((k) => k + 1);
                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  {/* GRID */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                    {/* Disposition */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Disposition
                      </p>
                      <Select
                        value={
                          (disposition || []).find(
                            (opt: any) => opt.id === values.disposition_id
                          ) || null
                        }
                        onChange={(selectedOption: any) => {
                          const id = selectedOption ? selectedOption.id : "";
                          const name = selectedOption
                            ? selectedOption.name
                            : "";
                          setFieldValue("disposition_id", id);
                          setFieldValue(
                            "conversation",
                            selectedOption && DISPO_AUTOFILL.has(name)
                              ? name
                              : ""
                          );
                        }}
                        onBlur={() => setFieldTouched("disposition_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => opt.id}
                        options={disposition}
                        placeholder="Select Disposition"
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
                              ? "var(--primary-500)"
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
                      {touched.disposition_id && errors.disposition_id && (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {String(errors.disposition_id)}
                        </p>
                      )}
                    </div>

                    {/* Agent */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Agent
                      </p>
                      <Select
                        value={
                          userRole === "Admin"
                            ? (agent || []).find(
                                (opt: any) => opt.id === values.agent_id
                              ) || null
                            : (agent || []).find(
                                (opt: any) => opt.id === data?.agent?.id
                              ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "agent_id",
                            selectedOption ? selectedOption.id : ""
                          )
                        }
                        onBlur={() => setFieldTouched("agent_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => opt.id}
                        options={agent}
                        placeholder="Select Agent"
                        isClearable
                        isDisabled={userRole !== "Admin"}
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
                              ? "var(--primary-500)"
                              : isFocused
                              ? "#222"
                              : "#000",
                            color: "#fff",
                            cursor:
                              userRole === "Admin" ? "pointer" : "not-allowed",
                          }),
                          singleValue: (base) => ({ ...base, color: "#fff" }),
                          input: (base) => ({ ...base, color: "#fff" }),
                          placeholder: (base) => ({ ...base, color: "#aaa" }),
                        }}
                      />
                      {touched.agent_id && errors.agent_id && (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {String(errors.agent_id)}
                        </p>
                      )}
                    </div>

                    {/* Conversation */}
                    <div className="w-full relative mt-4 col-span-2">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Conversation
                      </p>
                      <textarea
                        name="conversation"
                        value={values.conversation}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("conversation", true)}
                        placeholder="Enter conversation"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white"
                        rows={5}
                      />
                      {touched.conversation && errors.conversation && (
                        <p className="text-red-500 absolute top-[150px] text-xs">
                          {String(errors.conversation)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                    >
                      Create Lead Activity
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        )}
        {task && (
          <div className="w-full min-h-auto  text-white p-4">
            {/* Flyout content */}
            <div className="flex justify-between mb-4">
              <p className="text-primary-500 text-[26px] font-bold leading-9">
                Create Lead Task
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            {/* TASK FORM */}
            <Formik
              initialValues={{
                owner: data?.agent.id || "",
                associated_lead: data?.full_name || "",
                subject:
                  (selectedDropDownTaskValue
                    ? selectedDropDownTaskValue + ": "
                    : "") + (data?.full_name || ""),
                location: "online",
                description: "",
                start_at: defaultStart,
                end_at: defaultEnd,
              }}
              validationSchema={Yup.object({
                location: Yup.string().trim().required("Location is required"),
                description: Yup.string().trim().optional(),
                start_at: Yup.date().required("Start date is required"),
                end_at: Yup.date()
                  .required("End date is required")
                  .test("after", "End must be after start", function (value) {
                    const { start_at } = this.parent as {
                      start_at?: Date | null;
                    };
                    return start_at && value ? value > start_at : true;
                  }),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                const payload = {
                  lead_id: leadId,
                  assigned_agent_id: data?.agent?.id || "",
                  details: values.description || "",
                  subject: values.subject || "",
                  task_type: "followup",
                  start_at_text: values.start_at
                    ? formatDateTime(values.start_at)
                    : "",
                  end_at_text: values.end_at
                    ? formatDateTime(values.end_at)
                    : "",
                  location: values.location,
                  description: values.description || "",
                };
                await CreateTaskActivity(payload);
                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                setFieldTouched,
                setFieldValue,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Grid wrapper */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                    {/* Owner */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Owner
                      </p>
                      <input
                        type="hidden"
                        name="owner"
                        value={data?.agent?.id}
                        readOnly
                      />
                      <input
                        type="text"
                        value={data?.agent?.name || ""}
                        readOnly
                        className="capitalize w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white cursor-not-allowed"
                      />
                    </div>

                    {/* Associated Lead */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Associated Lead
                      </p>
                      <input
                        type="text"
                        name="associated_lead"
                        value={values.associated_lead}
                        readOnly
                        onBlur={() => setFieldTouched("associated_lead", true)}
                        className="capitalize w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white cursor-not-allowed"
                      />
                    </div>

                    {/* Subject */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Subject
                      </p>
                      <input
                        type="text"
                        name="subject"
                        value={values.subject}
                        readOnly
                        onBlur={() => setFieldTouched("subject", true)}
                        className="capitalize w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white cursor-not-allowed"
                      />
                    </div>

                    {/* Location */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Location
                      </p>
                      <input
                        type="text"
                        name="location"
                        value={values.location}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("location", true)}
                        placeholder="Enter location"
                        className="w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white"
                      />
                      {touched.location && errors.location && (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {String(errors.location)}
                        </p>
                      )}
                    </div>

                    {/* Schedule date: From */}
                    <div className="w-full md:col-span-2">
                      <p className="text-white font-medium text-base leading-6 mb-3">
                        Schedule
                      </p>

                      {/* From */}
                      <div className="w-full relative mb-4">
                        <p className="text-white font-medium text-sm leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={toPickerLocal(values.start_at)}
                          onChange={(date: Date | null) => {
                            const utcStart = fromPickerLocal(date);
                            setFieldValue("start_at", utcStart);
                            if (utcStart)
                              setFieldValue(
                                "end_at",
                                addMinutes(utcStart, DURATION_MINUTES)
                              );
                          }}
                          onBlur={() => setFieldTouched("start_at", true)}
                          showTimeSelect
                          timeFormat="h:mma"
                          timeIntervals={SLOT_MINUTES}
                          dateFormat="MM-dd-yyyy h:mma"
                          placeholderText="MM-dd-yyyy hh:mmam/pm"
                          className="w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white"
                          popperClassName="custom-datepicker"
                          minDate={startOfTodayCA()}
                          filterTime={(candidate) => {
                            const candCA = toPickerLocal(candidate)!; // candidate in CA time
                            const wStart = windowStartCA(candCA); // 10:00
                            const wEnd = windowEndCA(candCA); // 21:00
                            let earliest = wStart;

                            // If we're picking a time on "today" (Canada tz), earliest is the next slot after now
                            if (isSameDay(candCA, nowCA())) {
                              const nextSlot = roundUpToSlot(nowCA());
                              if (nextSlot > wEnd) return false; // past the day window
                              earliest = nextSlot < wStart ? wStart : nextSlot;
                            }

                            return (
                              candCA.getTime() >= earliest.getTime() &&
                              candCA.getTime() <= wEnd.getTime() // allow up to 21:00
                            );
                          }}
                          dayClassName={(date) => {
                            const todayCA = nowCA().toDateString();
                            const selectedCA = values.start_at
                              ? toPickerLocal(values.start_at)!.toDateString()
                              : null;
                            if (todayCA === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedCA === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                        />
                        {touched.start_at && errors.start_at && (
                          <p className="text-red-500 absolute top-[85px] text-xs">
                            {String(errors.start_at)}
                          </p>
                        )}
                      </div>

                      {/* To */}
                      <div className="w-full relative">
                        <p className="text-white font-medium text-sm leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={toPickerLocal(values.end_at)}
                          onChange={() => {}}
                          onBlur={() => setFieldTouched("end_at", true)}
                          showTimeSelect
                          timeFormat="h:mma"
                          timeIntervals={SLOT_MINUTES}
                          dateFormat="MM-dd-yyyy h:mma"
                          placeholderText="MM-dd-yyyy hh:mmam/pm"
                          disabled
                          className="w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white cursor-not-allowed"
                          popperClassName="custom-datepicker"
                          dayClassName={() => "pointer-events-none"}
                        />
                        {touched.end_at && errors.end_at && (
                          <p className="text-red-500 absolute top-[85px] text-xs">
                            {String(errors.end_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="w-full relative md:col-span-2">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Description (optional)
                      </p>
                      <textarea
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("description", true)}
                        placeholder="Add description (optional)"
                        rows={4}
                        className="w-full border border-gray-700 rounded-[4px] text-sm leading-5 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white resize-y"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                    >
                      Create Task Activity
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        )}
        {document && (
          <div className="w-full min-h-auto  text-white p-4">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Create Document
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            <form onSubmit={handleSubmitDocument} encType="multipart/form-data">
              <div className="w-full">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                  {/* Document Name */}
                  <div className="w-full">
                    <p className="text-white font-medium text-base leading-6 mb-2">
                      Document name
                    </p>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Enter notes"
                      required
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white"
                    />
                  </div>

                  {/* Document File */}
                  <div className="w-full">
                    <p className="text-white font-medium text-base leading-6 mb-2">
                      Document
                    </p>
                    <input
                      type="file"
                      name="file"
                      required
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white"
                    />
                  </div>
                </div>

                <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                  <button
                    type="submit"
                    className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                  >
                    Submit Document
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        {updateAcitivityHistory && (
          <div className="w-full min-h-auto  text-white p-4">
            {/* Flyout header */}
            <div className="flex justify-between mb-4">
              <p className="text-primary-500 text-[26px] font-bold leading-9">
                Update Activity History
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            {/* Formik form */}
            <Formik
              enableReinitialize
              initialValues={formInitialValues}
              validationSchema={CreateLeadsActivitySchema}
              onSubmit={async (values, { setSubmitting }) => {
                const payload: UpdateActivityPayload = {
                  id: values.id,
                  lead_id: values.lead_id,
                  conversation: values.conversation,
                  occurred_at: values.occurred_at || undefined,
                  disposition_id: values.disposition_id || undefined,
                  agent_id: values.agent_id || undefined,
                };
                try {
                  await UpdateLeadsActivity(payload);
                  setReloadKey((k) => k + 1);
                } catch (e) {
                  console.error("API error:", e);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Grid: Occurred At, Disposition, Agent */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                    {/* Occurred At */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Created At
                      </p>
                      <DatePicker
                        selected={
                          values.occurred_at
                            ? new Date(values.occurred_at)
                            : null
                        }
                        onChange={(date: Date | null) =>
                          setFieldValue(
                            "occurred_at",
                            date ? date.toISOString() : ""
                          )
                        }
                        onBlur={() => setFieldTouched("occurred_at", true)}
                        name="occurred_at"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="yyyy-mm-dd"
                        className="hover:shadow-hoverInputShadow focus-border-primary !w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white shadow-sm"
                        popperClassName="custom-datepicker"
                        dayClassName={(date) => {
                          const today = new Date().toDateString();
                          const selectedDate = values.occurred_at
                            ? new Date(values.occurred_at).toDateString()
                            : null;
                          if (today === date.toDateString())
                            return "bg-[#FFF0F1] text-[#A3000E]";
                          if (selectedDate === date.toDateString())
                            return "bg-[#A3000E] text-white";
                          return "hover:bg-[#222] hover:text-white";
                        }}
                      />
                      {touched.occurred_at && errors.occurred_at && (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {String(errors.occurred_at)}
                        </p>
                      )}
                    </div>

                    {/* Disposition */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Disposition
                      </p>
                      <Select
                        value={
                          (disposition || []).find(
                            (opt: any) =>
                              String(opt.id) === String(values.disposition_id)
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "disposition_id",
                            selectedOption ? String(selectedOption.id) : ""
                          )
                        }
                        onBlur={() => setFieldTouched("disposition_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => String(opt.id)}
                        options={disposition}
                        placeholder="Select Disposition"
                        isClearable
                        classNames={{
                          control: ({ isFocused }) =>
                            `!w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
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
                              ? "var(--primary-500)"
                              : isFocused
                              ? "#222"
                              : "#000",
                            color: "#fff",
                            cursor: "pointer",
                          }),
                          singleValue: (base) => ({ ...base, color: "#fff" }),
                          placeholder: (base) => ({ ...base, color: "#999" }),
                        }}
                      />
                    </div>

                    {/* Agent */}
                    <div className="w-full relative">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Agent
                      </p>
                      <Select
                        value={
                          (agent || []).find(
                            (opt: any) =>
                              String(opt.id) === String(values.agent_id)
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "agent_id",
                            selectedOption ? String(selectedOption.id) : ""
                          )
                        }
                        onBlur={() => setFieldTouched("agent_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => String(opt.id)}
                        options={agent}
                        placeholder="Select Agent"
                        isClearable
                        isDisabled={userRole !== "Admin"}
                        classNames={{
                          control: ({ isFocused }) =>
                            `!w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
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
                              ? "var(--primary-500)"
                              : isFocused
                              ? "#222"
                              : "#000",
                            color: "#fff",
                            cursor:
                              userRole === "Admin" ? "pointer" : "not-allowed",
                          }),
                          singleValue: (base) => ({ ...base, color: "#fff" }),
                          placeholder: (base) => ({ ...base, color: "#999" }),
                        }}
                      />
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="w-full relative md:col-span-2">
                    <p className="text-white font-medium text-base leading-6 mb-2">
                      Conversation
                    </p>
                    <textarea
                      name="conversation"
                      value={values.conversation}
                      onChange={handleChange}
                      onBlur={() => setFieldTouched("conversation", true)}
                      placeholder="Enter conversation"
                      rows={4}
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white"
                    />
                  </div>

                  {/* Submit */}
                  <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700"
                    >
                      Update Lead Activity
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        )}
        {isActivityFilter && (
          <div className="w-full min-h-auto  text-white p-4">
            <div className="flex justify-between mb-4">
              <p className="text-primary-500 text-[26px] font-bold leading-9">
                Filter Activity
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            <Formik<{
              conversation: string;
              disposition_id: string;
              agent_id: string;
              startDate: string;
              endDate: string;
              lead_id: string;
            }>
              initialValues={{
                conversation: "",
                disposition_id: "",
                agent_id: "",
                startDate: "",
                endDate: "",
                lead_id: leadId,
              }}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                if (
                  !values.conversation &&
                  !values.disposition_id &&
                  !values.agent_id &&
                  !values.startDate &&
                  !values.endDate
                ) {
                  toast.error("At least 1 field is required");
                } else {
                  try {
                    const res = await AxiosProvider.post(
                      "/lead/activity/filter",
                      values
                    );
                    setFetchLeadaActivityData(res.data.data.activities);
                    setFlyoutFilterOpen(false);
                    setIsActivityHistoryPaination(false);
                    setIsActvityFilter(false);
                    resetForm();
                  } catch (error) {
                    console.error("Error filtering activity:", error);
                    toast.error("Not Filtered, try again");
                  }
                }
                setSubmitting(false);
              }}
            >
              {(formik) => {
                type Option = { id: string; name: string };
                const fmt = (d: Date) => {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                };

                const {
                  values,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                } = formik;

                return (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Date Range */}
                    <div className="w-full flex flex-col md:flex-row gap-4 md:justify-between mb-4 sm:mb-6">
                      <div className="w-full md:w-[49%]">
                        <p className="text-white font-medium text-base leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={
                            values.startDate ? new Date(values.startDate) : null
                          }
                          onChange={(date: Date | null) =>
                            setFieldValue("startDate", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("startDate", true)}
                          name="startDate"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary !w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white shadow-sm"
                          popperClassName="custom-datepicker"
                        />
                      </div>

                      <div className="w-full md:w-[49%]">
                        <p className="text-white font-medium text-base leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={
                            values.endDate ? new Date(values.endDate) : null
                          }
                          onChange={(date: Date | null) =>
                            setFieldValue("endDate", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("endDate", true)}
                          name="endDate"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary !w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white shadow-sm"
                          popperClassName="custom-datepicker"
                        />
                      </div>
                    </div>

                    {/* Conversation / Disposition / Agent */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                      <div className="w-full relative">
                        <p className="text-white font-medium text-base leading-6 mb-2">
                          Conversation
                        </p>
                        <input
                          type="text"
                          name="conversation"
                          value={values.conversation}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("conversation", true)}
                          placeholder="Enter conversation"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-gray-700 rounded-[4px] text-sm leading-4 font-medium placeholder-gray-400 py-4 px-4 bg-black text-white"
                        />
                      </div>

                      <div className="w-full relative">
                        <p className="text-white font-medium text-base leading-6 mb-2">
                          Disposition
                        </p>
                        <Select
                          value={
                            (disposition || []).find(
                              (opt: Option) => opt.id === values.disposition_id
                            ) || null
                          }
                          onChange={(selected: Option | null) =>
                            setFieldValue(
                              "disposition_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() => setFieldTouched("disposition_id", true)}
                          getOptionLabel={(opt: Option) => opt.name}
                          getOptionValue={(opt: Option) => opt.id}
                          options={disposition}
                          placeholder="Select Disposition"
                          isClearable
                          classNames={{
                            control: ({ isFocused }) =>
                              `!w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
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
                                ? "var(--primary-500)"
                                : isFocused
                                ? "#222"
                                : "#000",
                              color: "#fff",
                              cursor: "pointer",
                            }),
                            singleValue: (base) => ({ ...base, color: "#fff" }),
                            placeholder: (base) => ({ ...base, color: "#999" }),
                          }}
                        />
                      </div>

                      <div className="w-full relative">
                        <p className="text-white font-medium text-base leading-6 mb-2">
                          Agent
                        </p>
                        <Select
                          value={
                            (agent || []).find(
                              (opt: Option) => opt.id === values.agent_id
                            ) || null
                          }
                          onChange={(selected: Option | null) =>
                            setFieldValue(
                              "agent_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() => setFieldTouched("agent_id", true)}
                          getOptionLabel={(opt: Option) => opt.name}
                          getOptionValue={(opt: Option) => opt.id}
                          options={agent}
                          placeholder="Select Agent"
                          isClearable
                          classNames={{
                            control: ({ isFocused }) =>
                              `!w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
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
                                ? "var(--primary-500)"
                                : isFocused
                                ? "#222"
                                : "#000",
                              color: "#fff",
                              cursor: "pointer",
                            }),
                            singleValue: (base) => ({ ...base, color: "#fff" }),
                            placeholder: (base) => ({ ...base, color: "#999" }),
                          }}
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700"
                      >
                        Filter Lead Activity
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
        {isTaskFilter && (
          <div className="w-full min-h-auto">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Filter Task
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

            {/* 🔎 Filter Tasks Formik — drop inside your existing component (uses your local leadId, agent list, etc.). 
    No Yup. Same UI/CSS patterns. Two date pickers: From / To (yyyy-MM-dd). 
    Endpoint: "/leads/tasks/fliter". Sends only non-empty fields. */}

            <Formik<{
              lead_id: string;
              details: string;
              from: string; // yyyy-MM-dd or ""
              to: string; // yyyy-MM-dd or ""
              subject: string;
              date: string; // yyyy-MM-dd or ""
              location: string;
              task_type: string;
              status: string;
              assigned_agent_id: string;
            }>
              initialValues={{
                lead_id: leadId, // ✅ from your local var
                details: "",
                from: "",
                to: "",
                subject: "",
                date: "",
                location: "",
                task_type: "",
                status: "",
                assigned_agent_id: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                // require at least one filter (besides lead_id)
                const { lead_id, ...rest } = values;
                const allEmpty = Object.values(rest).every((v) => !v);
                if (allEmpty) {
                  toast.error("At least 1 field is required");
                  setSubmitting(false);
                  return;
                }

                // date consistency (optional guard)
                if (values.from && values.to) {
                  const s = new Date(values.from);
                  const e = new Date(values.to);
                  if (e < s) {
                    toast.error("To date cannot be earlier than From date");
                    setSubmitting(false);
                    return;
                  }
                }

                // send only non-empty fields
                const payload = Object.fromEntries(
                  Object.entries(values).filter(
                    ([_, v]) => v !== "" && v != null
                  )
                );

                try {
                  const res = await AxiosProvider.post(
                    "/leads/tasks/filter",
                    payload
                  );
                  console.log(
                    "DDDDDDDDDDDDDDDDDDD1111111111111111",
                    res.data.data.task
                  );
                  setFilteredTasKData(res.data.data.task);
                } catch (err) {
                  console.error("Filter Task error:", err);
                  //  toast.error("Failed to filter tasks");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {(formik) => {
                // helpers INSIDE Formik
                type Option = { id: string; name: string };

                const fmt = (d: Date) => {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                };

                const {
                  values,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                } = formik;

                return (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* ===== Lead (readonly) ===== */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Lead ID
                        </p>
                        <input
                          type="text"
                          name="lead_id"
                          value={values.lead_id}
                          readOnly
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                        />
                      </div>

                      {/* Assigned Agent */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Assigned Agent
                        </p>
                        <Select
                          value={
                            (agent || []).find(
                              (opt: any) => opt.id === values.assigned_agent_id
                            ) || null
                          }
                          onChange={(selected: Option | null) =>
                            setFieldValue(
                              "assigned_agent_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() =>
                            setFieldTouched("assigned_agent_id", true)
                          }
                          getOptionLabel={(opt: Option) => opt.name}
                          getOptionValue={(opt: Option) => opt.id}
                          options={agent}
                          placeholder="Select Agent"
                          isClearable
                          classNames={{
                            control: ({ isFocused }) =>
                              `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
                                isFocused
                                  ? "!border-primary-500"
                                  : "!border-[#DFEAF2]"
                              }`,
                          }}
                          styles={{
                            menu: (base) => ({
                              ...base,
                              borderRadius: "4px",
                              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                              backgroundColor: "#fff",
                            }),
                            option: (base, { isFocused, isSelected }) => ({
                              ...base,
                              backgroundColor: isSelected
                                ? "var(--primary-500)"
                                : isFocused
                                ? "var(--primary-100)"
                                : "#fff",
                              color: isSelected ? "#fff" : "#333",
                              cursor: "pointer",
                            }),
                          }}
                        />
                      </div>
                    </div>

                    {/* ===== Date Range (From / To) ===== */}
                    <div className="w-full flex flex-col md:flex-row gap-4 md:justify-between mb-4 sm:mb-6">
                      {/* From */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={values.from ? new Date(values.from) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("from", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("from", true)}
                          name="from"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
               !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
               font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.from
                              ? new Date(values.from).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          maxDate={values.to ? new Date(values.to) : undefined}
                          isClearable
                        />
                      </div>

                      {/* To */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={values.to ? new Date(values.to) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("to", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("to", true)}
                          name="to"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
               !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
               font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.to
                              ? new Date(values.to).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          minDate={
                            values.from ? new Date(values.from) : undefined
                          }
                          isClearable
                        />
                      </div>
                    </div>

                    {/* ===== Single Date (optional) ===== */}
                    <div className="w-full mb-4 sm:mb-6">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        On Date
                      </p>
                      <DatePicker
                        selected={values.date ? new Date(values.date) : null}
                        onChange={(date: Date | null) =>
                          setFieldValue("date", date ? fmt(date) : "")
                        }
                        onBlur={() => setFieldTouched("date", true)}
                        name="date"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="yyyy-mm-dd"
                        className="hover:shadow-hoverInputShadow focus-border-primary 
             !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
             font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                        popperClassName="custom-datepicker"
                        dayClassName={(date) => {
                          const today = new Date().toDateString();
                          const selectedDate = values.date
                            ? new Date(values.date).toDateString()
                            : null;
                          if (today === date.toDateString())
                            return "bg-[#FFF0F1] text-[#A3000E]";
                          if (selectedDate === date.toDateString())
                            return "bg-[#A3000E] text-white";
                          return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                        }}
                        isClearable
                      />
                    </div>

                    {/* ===== Text Filters ===== */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                      {/* Subject */}
                      <div className="w-full">
                        <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                          Subject
                        </p>
                        <input
                          type="text"
                          name="subject"
                          value={values.subject}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("subject", true)}
                          placeholder="Subject contains…"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Details */}
                      <div className="w-full">
                        <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                          Details
                        </p>
                        <input
                          type="text"
                          name="details"
                          value={values.details}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("details", true)}
                          placeholder="Details contain…"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Location */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Location
                        </p>
                        <input
                          type="text"
                          name="location"
                          value={values.location}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("location", true)}
                          placeholder="Location contains…"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Task Type */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Task Type
                        </p>
                        <input
                          type="text"
                          name="task_type"
                          value={values.task_type}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("task_type", true)}
                          placeholder="e.g., meeting / followup / phonecall"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Status */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Status
                        </p>
                        <input
                          type="text"
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("status", true)}
                          placeholder="e.g., open / completed / overdue"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>
                    </div>

                    {/* ===== Actions ===== */}
                    <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700"
                      >
                        Filter Tasks
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
        {isDocumentFilter && (
          <div className="w-full min-h-auto">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Filter Document
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>
            <Formik<{
              lead_id: string;
              notes: string;
              from: string; // yyyy-MM-dd or ""
              to: string; // yyyy-MM-dd or ""
            }>
              initialValues={{
                lead_id: leadId, // 👈 dynamic
                notes: "",
                from: "",
                to: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                // Require at least one filter besides lead_id
                const { lead_id, ...rest } = values;
                if (Object.values(rest).every((v) => !v)) {
                  alert("At least 1 field is required");
                } else {
                  console.log("Filter Document payload:", values);
                  try {
                    const res = await AxiosProvider.post(
                      "/leads/documents/filter",
                      values
                    );
                    // console.log(
                    //   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
                    //   res.data.data.data
                    // );
                    setDocs(res.data.data.data);
                  } catch (err) {
                    console.error("Filter Task error:", err);
                    //  toast.error("Failed to filter tasks");
                  }

                  // 🔧 If/when you want to call the API:
                  // const payload = Object.fromEntries(Object.entries(values).filter(([_, v]) => v !== "" && v != null));
                  // AxiosProvider.post("/leads/documents/filter", payload)
                  //   .then(res => console.log("Filter Document result:", res.data))
                  //   .catch(err => console.error("Filter Document error:", err));
                }
                setSubmitting(false);
              }}
            >
              {(formik) => {
                const {
                  values,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                } = formik;

                const fmt = (d: Date) => {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                };

                return (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Lead ID (readonly) */}
                    <div className="mb-4">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Lead ID
                      </p>
                      <input
                        type="text"
                        name="lead_id"
                        value={values.lead_id}
                        readOnly
                        className="hover:shadow-hoverInputShadow focus-border-primary 
              w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
              font-medium placeholder-[#717171] py-4 px-4 text-firstBlack 
              bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Notes
                      </p>
                      <input
                        type="text"
                        name="notes"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("notes", true)}
                        placeholder="Enter notes"
                        className="hover:shadow-hoverInputShadow focus-border-primary 
              w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
              font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                      />
                    </div>

                    {/* Date Range (From / To) */}
                    <div className="w-full flex flex-col md:flex-row gap-4 md:justify-between mb-6">
                      {/* From */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={values.from ? new Date(values.from) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("from", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("from", true)}
                          name="from"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
                !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
                font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.from
                              ? new Date(values.from).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          maxDate={values.to ? new Date(values.to) : undefined}
                          isClearable
                        />
                      </div>

                      {/* To */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={values.to ? new Date(values.to) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("to", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("to", true)}
                          name="to"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
                !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
                font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.to
                              ? new Date(values.to).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          minDate={
                            values.from ? new Date(values.from) : undefined
                          }
                          isClearable
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] 
              text-base font-medium leading-6 text-white 
              hover:bg-primary-700 w-full text-center"
                      >
                        Filter Document
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
        {isDocumentEdit && (
          <div className="w-full min-h-auto">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Update Document
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-[#E7E7E7]  rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

            <form onSubmit={handleUpdateDocument} encType="multipart/form-data">
              <div className="w-full">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                  {/* Document name */}
                  <div className="w-full">
                    <p className=" font-medium text-base leading-6 mb-2">
                      Document name
                    </p>
                    <input
                      type="text"
                      value={
                        documentName !== undefined
                          ? documentName
                          : documentEditObjectData?.notes || ""
                      } // Display documentName or fallback to documentEditObjectData?.notes
                      onChange={(e) => setDocumentName(e.target.value)} // Update documentName on user input
                      placeholder="Enter document name"
                      required
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 bg-black"
                    />
                  </div>

                  {/* Replace file */}
                  <div className="w-full">
                    <p className=" font-medium text-base leading-6 mb-2">
                      Replace file (optional)
                    </p>
                    <input
                      type="file"
                      name="file"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4  bg-black"
                    />
                    {documentEditObjectData && (
                      <p className="text-xs text-gray-500 mt-2">
                        Current:{" "}
                        <a
                          href={documentEditObjectData.download}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-primary-600"
                        >
                          {documentEditObjectData.file_name}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                  <button
                    type="submit"
                    className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                  >
                    Update Document
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        {isTaskEdit && (
          <>
            <div className="w-full min-h-auto">
              <div className="flex justify-between mb-4">
                <p className="text-primary-600 text-[26px] font-bold leading-9">
                  Update Task
                </p>
                <IoCloseOutline
                  onClick={() => closeFlyOut()}
                  className="h-8 w-8 border border-[#E7E7E7]  rounded cursor-pointer"
                />
              </div>
              <div className="w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORMIK */}
              <Formik
                enableReinitialize
                initialValues={{
                  // ------ shared ------
                  location: taskEditObject?.location ?? "",
                  description:
                    taskEditObject?.description ??
                    taskEditObject?.details ??
                    "",
                  start_at:
                    (taskEditObject?.start_at
                      ? new Date(taskEditObject.start_at)
                      : defaultStart) || defaultStart,
                  end_at:
                    (taskEditObject?.end_at
                      ? new Date(taskEditObject.end_at)
                      : taskEditObject?.start_at
                      ? addMinutes(new Date(taskEditObject.start_at), 15)
                      : defaultEnd) || defaultEnd,

                  // ------ create-only (ignored in edit UI) ------
                  owner: data?.agent?.id || "",
                  associated_lead: data?.full_name || "",
                  subject:
                    (selectedDropDownTaskValue
                      ? selectedDropDownTaskValue + ": "
                      : "") + (data?.full_name || ""),
                }}
                validationSchema={Yup.object({
                  location: Yup.string()
                    .trim()
                    .required("Location is required"),
                  description: Yup.string().trim().optional(),
                  start_at: Yup.date().required("Start date is required"),
                  end_at: Yup.date()
                    .required("End date is required")
                    .test("after", "End must be after start", function (value) {
                      const { start_at } = this.parent as {
                        start_at?: Date | null;
                      };
                      return start_at && value ? value > start_at : true;
                    }),
                })}
                onSubmit={async (values, { setSubmitting }) => {
                  const isEditing = !!taskEditObject;

                  if (isEditing) {
                    // ----- UPDATE payload -----
                    const payload = {
                      task_id: taskEditObject?.id,
                      location: values.location,
                      description: values.description || "",
                      start_at_text: values.start_at
                        ? formatDateTime(values.start_at)
                        : "",
                      end_at_text: values.end_at
                        ? formatDateTime(values.end_at)
                        : "",
                    };

                    console.log("UPDATE TASK PAYLOAD =>", payload);
                    try {
                      await AxiosProvider.post("/leads/tasks/edit", payload);
                      toast.success("Lead task is updated");
                      setHitApi(!hitApi);
                      closeFlyOut();
                    } catch (error: any) {
                      toast.error("Lead task is not updated");
                    }
                    // TODO: call your update API here instead of console:
                    // await UpdateTaskActivity(payload);
                  } else {
                    // ----- CREATE payload (your original) -----
                    const payload = {
                      lead_id: leadId,
                      assigned_agent_id: data?.agent?.id || "",
                      details: values.description || "",
                      subject: values.subject || "",
                      task_type: "followup",
                      start_at_text: values.start_at
                        ? formatDateTime(values.start_at)
                        : "",
                      end_at_text: values.end_at
                        ? formatDateTime(values.end_at)
                        : "",
                      location: values.location,
                      description: values.description || "",
                    };
                    // await CreateTaskActivity(payload);
                  }

                  setSubmitting(false);
                  closeFlyOut();
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  setFieldTouched,
                  setFieldValue,
                  isSubmitting,
                }) => {
                  const isEditing = !!taskEditObject;

                  return (
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                        {/* ====== CREATE-ONLY FIELDS ====== */}
                        {!isEditing && (
                          <>
                            {/* Owner (readonly: submit id, display name) */}
                            <div className="w-full relative">
                              <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                                Owner
                              </p>
                              <input
                                type="hidden"
                                name="owner"
                                value={data?.agent?.id}
                                readOnly
                              />
                              <input
                                type="text"
                                value={data?.agent?.name || ""}
                                readOnly
                                className="capitalize hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                              />
                            </div>

                            {/* Associated Lead (readonly) */}
                            <div className="w-full relative">
                              <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                                Associated Lead
                              </p>
                              <input
                                type="text"
                                name="associated_lead"
                                value={values.associated_lead}
                                readOnly
                                onBlur={() =>
                                  setFieldTouched("associated_lead", true)
                                }
                                className="capitalize hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                              />
                            </div>

                            {/* Subject (readonly) */}
                            <div className="w-full relative md:col-span-2">
                              <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                                Subject
                              </p>
                              <input
                                type="text"
                                name="subject"
                                value={values.subject}
                                readOnly
                                onBlur={() => setFieldTouched("subject", true)}
                                placeholder="Subject"
                                className="capitalize hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                              />
                            </div>
                          </>
                        )}

                        {/* ====== COMMON FIELDS (shown in BOTH, but these are the ONLY ones in EDIT) ====== */}

                        {/* Location (required) */}
                        <div className="w-full relative md:col-span-2">
                          <p className=" font-medium text-base leading-6 mb-2">
                            Location
                          </p>
                          <input
                            type="text"
                            name="location"
                            value={values.location}
                            onChange={handleChange}
                            onBlur={() => setFieldTouched("location", true)}
                            placeholder="Enter location"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4  bg-black"
                          />
                          {touched.location && (errors as any).location ? (
                            <p className="text-red-500 mt-1 text-xs">
                              {(errors as any).location}
                            </p>
                          ) : null}
                        </div>

                        {/* ===== Schedule (From / To) ===== */}
                        <div className="w-full md:col-span-2">
                          <p className=" font-medium text-base leading-6 mb-3">
                            Schedule
                          </p>

                          {/* From */}
                          <div className="w-full relative mb-4">
                            <div className="w-full relative mb-4">
                              <p className=" font-medium text-sm leading-6 mb-2">
                                From
                              </p>
                              <DatePicker
                                /* SHOW as Canada time */
                                selected={toPickerLocal(values.start_at)}
                                /* TAKE as Canada time -> store UTC and set end = start + 30 */
                                onChange={(date: Date | null) => {
                                  const utcStart = fromPickerLocal(date);
                                  setFieldValue("start_at", utcStart);
                                  if (utcStart)
                                    setFieldValue(
                                      "end_at",
                                      addMinutes(utcStart, 30)
                                    );
                                }}
                                onBlur={() => setFieldTouched("start_at", true)}
                                name="start_at"
                                showTimeSelect
                                timeFormat="h:mma"
                                timeIntervals={15} // 15-min steps
                                dateFormat="MM-dd-yyyy h:mma"
                                placeholderText="MM-dd-yyyy hh:mmam/pm"
                                className="hover:shadow-hoverInputShadow focus-border-primary !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 bg-black shadow-s"
                                popperClassName="custom-datepicker"
                                dayClassName={(date) => {
                                  const todayCA = nowCA().toDateString();
                                  const selectedCA = values.start_at
                                    ? toPickerLocal(
                                        values.start_at
                                      )!.toDateString()
                                    : null;
                                  if (todayCA === date.toDateString())
                                    return "bg-[#FFF0F1] text-[#A3000E]";
                                  if (selectedCA === date.toDateString())
                                    return "bg-[#A3000E] text-white";
                                  return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                                }}
                                /* Disable past days */
                                minDate={startOfTodayCA()}
                                /* HIDE times outside 10:00am–8:30pm, and hide today's past times */
                                filterTime={(candidate: Date) => {
                                  const candCA = toPickerLocal(candidate)!;

                                  // Build window bounds on the candidate's local day
                                  const y = candCA.getFullYear();
                                  const m = candCA.getMonth();
                                  const d = candCA.getDate();
                                  const wStart = new Date(y, m, d, 10, 0, 0, 0); // 10:00 AM
                                  const wLastStart = new Date(
                                    y,
                                    m,
                                    d,
                                    20,
                                    30,
                                    0,
                                    0
                                  ); // 8:30 PM (latest start)

                                  // Default earliest = 10:00
                                  let earliest = wStart;

                                  // If candidate is today (Canada), earliest is the next 15-min slot within window
                                  const now = nowCA();
                                  const isToday =
                                    now.getFullYear() === y &&
                                    now.getMonth() === m &&
                                    now.getDate() === d;
                                  if (isToday) {
                                    const next = new Date(now);
                                    next.setSeconds(0, 0);
                                    const mins = next.getMinutes();
                                    next.setMinutes(
                                      mins + ((15 - (mins % 15)) % 15)
                                    ); // round up to 15
                                    if (next > wLastStart) return false; // no slots left today
                                    earliest = next < wStart ? wStart : next;
                                  }

                                  // Allow only [earliest, 20:30]
                                  return (
                                    candCA.getTime() >= earliest.getTime() &&
                                    candCA.getTime() <= wLastStart.getTime()
                                  );
                                }}
                              />
                              {touched.start_at && (errors as any).start_at ? (
                                <p className="text-red-500 absolute top-[85px] text-xs">
                                  {(errors as any).start_at}
                                </p>
                              ) : null}
                            </div>

                            {touched.start_at && (errors as any).start_at ? (
                              <p className="text-red-500 absolute top-[85px] text-xs">
                                {(errors as any).start_at}
                              </p>
                            ) : null}
                          </div>

                          {/* To (read-only) */}
                          <div className="w-full relative">
                            <p className=" font-medium text-sm leading-6 mb-2">
                              To
                            </p>
                            <DatePicker
                              /* SHOW end time as Canada time */
                              selected={toPickerLocal(values.end_at)}
                              onChange={() => {}}
                              onBlur={() => setFieldTouched("end_at", true)}
                              name="end_at"
                              showTimeSelect
                              timeFormat="h:mma"
                              timeIntervals={15} // display grid at 15-min
                              dateFormat="MM-dd-yyyy h:mma"
                              placeholderText="MM-dd-yyyy hh:mmam/pm"
                              disabled
                              className="hover:shadow-hoverInputShadow focus-border-primary 
        !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
        font-medium placeholder-[#717171] py-4 px-4 bg-black cursor-not-allowed"
                              popperClassName="custom-datepicker"
                              dayClassName={() => "pointer-events-none"}
                            />
                            {touched.end_at && (errors as any).end_at ? (
                              <p className="text-red-500 absolute top-[85px] text-xs">
                                {(errors as any).end_at}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="w-full relative md:col-span-2">
                          <p className=" font-medium text-base leading-6 mb-2">
                            Description (optional)
                          </p>
                          <textarea
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={() => setFieldTouched("description", true)}
                            placeholder="Add description (optional)"
                            rows={4}
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-5 font-medium placeholder-[#717171] py-4 px-4 bg-black resize-y"
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                        >
                          {taskEditObject
                            ? "Save Changes"
                            : "Create Task Activity"}
                        </button>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </>
        )}
        {isSendTemplate && (
          <div className="w-full min-h-auto  text-white p-4">
            {/* Flyout Header */}
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Send Template
              </p>
              <IoCloseOutline
                onClick={() => closeFlyOut()}
                className="h-8 w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4"></div>

            {/* FORM */}

            <Formik
              initialValues={{
                templateId: "",
                recipientEmail: data?.email || "",
              }}
              validationSchema={Yup.object({
                templateId: Yup.string().required("Template is required"),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setSubmitting(true); // ensure submitting state
                  const payload = {
                    templateId: values.templateId,
                    recipientEmail: values.recipientEmail,
                  };
                  await AxiosProvider.post("/email-template", payload);
                  toast.success("Template sent successfully");
                  closeFlyOut();
                } catch (error: any) {
                  console.error("Error sending template:", error);
                  toast.error("Failed to send template");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                isSubmitting,
              }) => {
                const options: TemplateOption[] = (templateData as any[]).map(
                  (o: any) =>
                    typeof o === "string"
                      ? { id: o, title: o }
                      : { id: o.id, title: o.title }
                );

                const selected =
                  options.find((opt) => opt.id === values.templateId) || null;

                return (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Single Required Dropdown */}
                    <div className="w-full grid grid-cols-1 gap-4 mb-4 sm:mb-6">
                      <div className="w-full relative">
                        <p className="text-white font-medium text-base leading-6 mb-2">
                          Template
                        </p>

                        <Select
                          value={selected}
                          onChange={(opt: any) =>
                            setFieldValue("templateId", opt ? opt.id : "")
                          }
                          onBlur={() => setFieldTouched("templateId", true)}
                          getOptionLabel={(opt: any) =>
                            opt.title ?? opt.name ?? String(opt)
                          }
                          getOptionValue={(opt: any) => opt.id}
                          options={options}
                          placeholder="Select Template"
                          isClearable
                          isDisabled={isSubmitting} // ⬅️ disable while submitting
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
                                ? "var(--primary-500)"
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

                        {touched.templateId && errors.templateId && (
                          <p className="text-red-500 absolute top-[85px] text-xs">
                            {String(errors.templateId)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Button */}
                    <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className={`py-[13px] px-[26px] bg-primary-600 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white ${
                          isSubmitting ? "opacity-70 pointer-events-none" : ""
                        }`}
                      >
                        {isSubmitting ? "Sending…" : "Send Template"}
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
      </div>

      {/* FITLER FLYOUT END */}
    </>
  );
}

