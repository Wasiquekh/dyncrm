"use client";
import Image from "next/image";
import { FormEvent, useContext, useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaGreaterThan } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
//import { appCheck } from "../firebase-config";
import { getToken } from "firebase/app-check";
import AxiosProvider from "../../provider/AxiosProvider";
import StorageManager from "../../provider/StorageManager";
import LeftSideBar from "../component/LeftSideBar";
import { useRouter, useSearchParams } from "next/navigation";
import { HiChevronDoubleLeft, HiOutlineTemplate } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import { number, setLocale } from "yup";
import { RiDeleteBin6Line, RiFilterFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { RiAccountCircleLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Select from "react-select";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaRegIdCard, FaUserEdit, FaUserTag } from "react-icons/fa";
import { MdDateRange, MdEdit, MdViewModule } from "react-icons/md";
import Swal from "sweetalert2";
import browserImageCompression from "browser-image-compression";

const axiosProvider = new AxiosProvider();


// -------- HELPERS TO UPLOAD MULTIPLE FILES -------------
const MAX_FILE_MB = 95;
const BYTES = (mb: number) => mb * 1024 * 1024;

// Acceptable file types (including WebP)
const OK_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

// File validation function
function validateFileClientSide(file: File) {
  if (!OK_TYPES.includes(file.type)) throw new Error("Unsupported file type");
  if (file.size > BYTES(MAX_FILE_MB))
    throw new Error(`File > ${MAX_FILE_MB} MB. Please compress/split.`);
}

// Compress the image before sending it
const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.5, // Reduce to 0.5 MB
    maxWidthOrHeight: 1024, // Reduce max width/height to 1024px
    useWebWorker: true,
    initialQuality: 0.5, // Reduce image quality to 50% (lower values give more compression)
    fileType: file.type, // Keep the original file type (e.g., .jpeg, .png)
  };

  try {
    const compressedFile = await browserImageCompression(file, options);
    console.log("Compressed file:", compressedFile);

    // Get the original file extension
    const fileExtension = file.name.split(".").pop();

    // Create a new File object with the compressed content and the original name (keeping the same extension)
    const newFile = new File([compressedFile], file.name, { type: file.type });

    return newFile;
  } catch (error) {
    console.error("Image compression error:", error);
    throw new Error("Image compression failed");
  }
};

// -------- END HELPERS TO UPLOAD MULTIPLE FILES -------------

type TemplateForAdd = {
  id: string;
  title: string;
  subject: string;
  body: string;
  // Optional existing file meta if you want to show it
  attachment_name?: string;
  attachment_url?: string;
};

interface Attachment {
  name: string;
  path: string;
  type: string;
  url: string;
}

interface TemplateForEdit {
  id: string;
  title: string;
  subject: string;
  body: string;
  attachments?: Attachment[]; // Optional field to hold multiple attachments
}

export default function Home() {
  const checking = useAuthRedirect();
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const [data, setData] = useState<TemplateForAdd[]>([]);
  console.log("user activity dara", data);
  const [pageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hitApi, setHitApi] = useState<boolean>(false);
  const [addFrom, setAddForm] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [editObjectData, setObjectData] = useState<TemplateForEdit | null>(
    null
  );
  // console.log("OOOOOOOOOOOOOOOOOOOOOO", editObjectData);
  // ------------------IMAGE COMPRESSION--------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  // --------------END IMAGE COMPRESSION----------------
  const closeFlyout = () => {
    setFlyoutFilterOpen(false);
    setAddForm(false);
    setEditForm(false);
  };
  const addFormFunction = () => {
    setFlyoutFilterOpen(true);
    setAddForm(true);
  };
  const editFormFunction = (item: any) => {
    setFlyoutFilterOpen(true);
    setEditForm(true);
    setObjectData(item);
  };
  const storage = new StorageManager();

  const router = useRouter();

  // Assuming `dataUserName` is an array of users

  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await AxiosProvider.post("/gettemplate");

        // const result = response.data.data.data;
        console.log("888888888888888888", response.data.data);
        setData(response.data.data);
        // console.log(
        //   "888888888888888888",
        //   response.data.data.pagination.totalPages
        // );
        //  setTotalPages(response.data.data.pagination.totalPages);
        setIsError(false);
      } catch (error: any) {
        setIsError(true);
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hitApi]); // 👈 depends on `page`

  const deleteUserData = async (id: string) => {
    const userID = id;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AxiosProvider.post("/deletetemplate", { id: userID });

          toast.success("Successfully Deleted");
          setHitApi(!hitApi);
          // await activityLogger.userDelete(userID);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };

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
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <LeftSideBar />
        <div className="ml-[97px] w-full md:w-[90%] m-auto  min-h-[500px]  rounded p-4 mt-0 ">
          {/* left section top row */}
          <DesktopHeader />
          {/* right section top row */}

          {/* Main content middle section */}
          <div className="rounded-3xl   px-1 py-6 md:p-6 relative mainContainerBg">
            {/* ----------------Table----------------------- */}
            <div className="relative overflow-x-auto  sm:rounded-lg">
              {/* Search and filter table row */}
              <div className=" flex justify-end items-center mb-6  w-full mx-auto">
                <div className=" flex justify-center items-center gap-4">
                  <div
                    className=" flex items-center gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 group hover:bg-primary-700"
                    onClick={() => addFormFunction()}
                  >
                    <HiOutlineTemplate className=" w-4 h-4 text-white group-hover:text-white" />
                    <p className=" text-white  text-base font-medium group-hover:text-white">
                      Create Template
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-x-auto sm:rounded">
                {/* import { MdEdit } from "react-icons/md"; // add this at the top */}
                <table className="w-full text-sm text-left text-white whitespace-nowrap">
                  <thead className="text-xs talbleheaderBg text-white">
                    <tr>
                      <th className="px-1 py-3 md:p-3">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white text-base leading-normal">
                            Title
                          </div>
                        </div>
                      </th>
                      <th className="px-2 py-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white text-base leading-normal">
                            Action
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {!data || data.length === 0 || isError ? (
                      <tr>
                        <td colSpan={2} className="text-center py-6 text-white">
                          Data not found
                        </td>
                      </tr>
                    ) : (
                      data.map((item: any, index: number) => (
                        <tr
                          key={item?.id ?? index}
                          className="hover:bg-primary-600 border-b border-[#E7E7E7] odd:bg-[#404040]"
                        >
                          {/* Title */}
                          <td className="px-1 md:p-3 py-2">
                            <p className="text-white text-sm sm:text-base leading-normal truncate capitalize">
                              {item?.title ?? "-"}
                            </p>
                          </td>

                          {/* Action (Edit + Delete) */}
                          <td className="px-2 py-1">
                            <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                              <button
                                onClick={() => editFormFunction(item)}
                                className="py-[4px] px-3 bg-black hover:bg-primary-700 active:bg-primary-800 flex gap-1 items-center rounded-xl text-xs md:text-sm"
                                aria-label="Edit"
                                title="Edit"
                              >
                                <MdEdit className="text-white w-4 h-4" />
                              </button>

                              <button
                                onClick={() => deleteUserData(item.id)}
                                className="py-[4px] px-3 bg-black hover:bg-primary-800 active:bg-primary-700 flex gap-1 items-center rounded-full text-xs md:text-sm"
                                aria-label="Delete"
                                title="Delete"
                              >
                                <RiDeleteBin6Line className="text-white w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* ----------------End table--------------------------- */}

          {/* ------------------- */}
        </div>
      </div>

      {/* DARK BG SCREEN */}

      {/* FITLER FLYOUT */}
      {isFlyoutFilterOpen && (
        <div
          className="min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => closeFlyout()}
        ></div>
      )}

      {/* NOW MY FLYOUT */}
      <div className={`filterflyout ${isFlyoutFilterOpen ? "filteropen" : ""}`}>
        {addFrom && (
          <div className="w-full min-h-auto  p-4 text-white">
            {/* Header */}
            <div className="flex justify-between mb-4 sm:mb-6 md:mb-8">
              <p className="text-primary-600 text-[22px] sm:text-[24px] md:text-[26px] font-bold leading-8 sm:leading-9">
                Create Template
              </p>
              <IoCloseOutline
                onClick={() => closeFlyout()}
                className="h-7 sm:h-8 w-7 sm:w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-gray-700 mb-4 sm:mb-6"></div>
            <Formik
              initialValues={{
                title: "",
                subject: "",
                body: "",
                files: [] as File[], // Store multiple files
              }}
              validate={(values) => {
                const errors: Record<string, string | string[]> = {};
                if (!values.title) errors.title = "Title is required";
                if (!values.subject) errors.subject = "Subject is required";
                if (!values.body) errors.body = "Body is required";

                const fileErrors: string[] = [];

                // Validate each file (size + type)
                if (values.files?.length) {
                  values.files.forEach((file) => {
                    try {
                      // Use the helper function here for detailed validation
                      validateFileClientSide(file);
                    } catch (e: any) {
                      // Add the specific error message to the list
                      fileErrors.push(`${file.name}: ${e.message}`);
                    }
                  });

                  // If there are any file-specific errors, report them
                  if (fileErrors.length > 0) {
                    errors.files = fileErrors;
                  }
                } else {
                  // Only set this error if there are no files *and* no file-specific errors from a previous selection
                  errors.files = "Please select at least one file";
                }

                return errors;
              }}
              onSubmit={async (values, { resetForm, setSubmitting }) => {
                console.log("Form values before API call:", values); // Log Formik values before submitting

                // Check if files are correctly selected
                console.log("Files selected:", values.files); // Log selected files

                if (!values.files || values.files.length === 0) {
                  toast.error("No files selected");
                  return;
                }

                setIsSubmitting(true); // Disable submit button

                // Create a FormData object
                const fd = new FormData();
                fd.append("title", values.title);
                fd.append("subject", values.subject);
                fd.append("body", values.body);

                try {
                  // Compress each image before adding to FormData
                  const compressedFiles = await Promise.all(
                    values.files.map(async (file) => {
                      if (file.type.startsWith("image/")) {
                        return compressImage(file); // Compress image files
                      } else {
                        return file; // Return non-image files without compression
                      }
                    })
                  );

                  // Append each file (compressed or original) to FormData
                  compressedFiles.forEach((file) => {
                    fd.append("files", file);
                  });

                  // Debugging: log FormData contents before submitting
                  console.log("FormData before submitting:");
                  for (let [key, value] of fd.entries()) {
                    console.log(`${key}:`, value); // Log each key-value pair from FormData
                  }

                  // Make the API request
                  const res = await AxiosProvider.post("/createtemplate", fd, {
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                    timeout: 30 * 60 * 1000,
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  });

                  console.log("Upload response:", res);
                  toast.success("Uploaded successfully!");
                  resetForm(); // Reset the form after successful submission
                  closeFlyout();
                  setHitApi(!hitApi);
                } catch (err: any) {
                  console.error("Upload failed:", err);
                  if (err?.response?.status === 413) {
                    toast.error(
                      `File too large for server limit. Try a smaller file.`
                    );
                  } else if (err?.code === "ERR_NETWORK") {
                    toast.error(`Network/proxy blocked the upload.`);
                  } else if (
                    typeof err?.message === "string" &&
                    /Unsupported file type|File >/i.test(err.message)
                  ) {
                    toast.error(err.message);
                  } else {
                    toast.error("Upload failed.");
                  }
                } finally {
                  setSubmitting(false); // Enable submit button
                  setIsSubmitting(false); // Reset the submitting state
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="w-full space-y-5">
                    {/* Title Field */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Title
                      </p>
                      <input
                        type="text"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
                        placeholder="Enter title"
                        className="w-full h-[50px] border rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.title && errors.title && (
                        <div className="text-red-500 text-sm">
                          {errors.title}
                        </div>
                      )}
                    </div>

                    {/* Subject Field */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Subject
                      </p>
                      <input
                        type="text"
                        name="subject"
                        value={values.subject}
                        onChange={handleChange}
                        placeholder="Enter subject"
                        className="w-full h-[50px] border rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.subject && errors.subject && (
                        <div className="text-red-500 text-sm">
                          {errors.subject}
                        </div>
                      )}
                    </div>

                    {/* File Upload Field */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Files (You can select multiple)
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const list = Array.from(e.target.files || []);
                          setFieldValue("files", list); // Update Formik with selected files
                          console.log("Files selected:", list); // Log selected files to verify they're being captured by Formik
                        }}
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.zip,.rar,.txt,.xlsx,.pptx"
                        className="w-full h-[50px] border rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black file:mr-4 file:py-2 file:px-4 file:rounded-[4px] file:border-0 file:text-sm file:font-semibold file:bg-primary-700 file:text-white hover:file:bg-primary-800 pt-[6px]"
                      />
                      {touched.files && errors.files && (
                        <div className="text-red-500 text-sm text-center mt-1">
                          {Array.isArray(errors.files)
                            ? errors.files.map((error, index) => (
                                <div key={index} className="text-left">
                                  {error}
                                </div>
                              ))
                            : errors.files}
                        </div>
                      )}

                      {/* Display Selected Files */}
                      {values.files?.length > 0 && (
                        <ul className="text-xs text-gray-300 space-y-1 mt-2">
                          {values.files.map((f, i) => (
                            <li key={i} className="flex justify-between">
                              <span className="truncate">{f.name}</span>
                              <span>
                                ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Body Field (Text Area) */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Body
                      </p>
                      <textarea
                        name="body"
                        value={values.body}
                        onChange={handleChange}
                        placeholder="Enter body"
                        rows={4} // You can adjust the row count
                        className="w-full border rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black pt-2"
                      />
                      {touched.body && errors.body && (
                        <div className="text-red-500 text-sm">
                          {errors.body}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`py-[13px] px-[26px] w-full rounded-[4px] text-white text-center ${
                        isSubmitting
                          ? "bg-primary-700 opacity-60 cursor-not-allowed"
                          : "bg-primary-700 hover:bg-primary-800"
                      }`}
                    >
                      {isSubmitting ? "Uploading..." : "Submit"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
        {editForm && (
          <div className="w-full min-h-auto  p-4 text-white">
            {/* Header */}
            <div className="flex justify-between mb-4 sm:mb-6 md:mb-8">
              <p className="text-primary-600 text-[22px] sm:text-[24px] md:text-[26px] font-bold leading-8 sm:leading-9">
                Edit Template
              </p>
              <IoCloseOutline
                onClick={() => closeFlyout()}
                className="h-7 sm:h-8 w-7 sm:w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>

            <div className="w-full border-b border-gray-700 mb-4 sm:mb-6"></div>
   <Formik
  enableReinitialize
  initialValues={{
    id: editObjectData?.id ?? "",
    title: editObjectData?.title ?? "",
    subject: editObjectData?.subject ?? "",
    body: editObjectData?.body ?? "",
    files: [] as File[], // Store multiple files (new ones)
  }}
  validationSchema={Yup.object({
    id: Yup.string().required("Template ID is required"),
    title: Yup.string().required("Title is required"),
    subject: Yup.string().required("Subject is required"),
    body: Yup.string().required("Body is required"),
    files: Yup.array()
      .of(
        Yup.mixed<File>()
          .test(
            "file-size",
            `Each file must be ≤ ${MAX_FILE_MB} MB`,
            (v) => !v || v.size <= MAX_FILE_MB * 1024 * 1024
          )
          .test(
            "file-type",
            "Only JPG, PNG, WEBP, PDF, DOC, DOCX allowed",
            (v) =>
              !v ||
              [
                "image/jpeg",
                "image/png",
                "image/webp", // Added support for .webp files
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ].includes(v.type)
          )
      )
      .notRequired(), // Optional on update
  })}
  onSubmit={async (values, { setSubmitting, resetForm }) => {
    try {
      const fd = new FormData();
      fd.append("id", values.id);
      fd.append("title", values.title);
      fd.append("subject", values.subject);
      fd.append("body", values.body);

      // If no new files picked, this is a metadata-only update (still single call)
      // If files picked, append ALL in the SAME request
      if (values.files && values.files.length > 0) {
        for (const file of values.files) {
          // Change "files" to "files[]" if your backend expects that
          fd.append("files", file);
        }
      }

      const response = await AxiosProvider.post("/updatetemplate", fd, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 30 * 60 * 1000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded / e.total) * 100);
            console.log(`Uploading: ${pct}%`);
          }
        },
      });

      toast.success("Template updated successfully!");
      closeFlyout();
      setHitApi(!hitApi);
      resetForm();
    } catch (err: any) {
      console.error("❌ Update error:", err);
      if (err?.response?.status === 413) {
        toast.error(`File too large for server limit. Try a smaller file.`);
      } else if (err?.code === "ERR_NETWORK") {
        toast.error(`Network/proxy blocked the upload (likely size limit).`);
      } else {
        toast.error("Failed to update the template.");
      }
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
    setFieldValue,
    handleSubmit,
    isSubmitting,
  }) => (
    <Form onSubmit={handleSubmit}>
      <div className="w-full space-y-5">
        {/* Hidden ID */}
        <input type="hidden" name="id" value={values.id} readOnly />

        {/* Title */}
        <div className="w-full">
          <p className="text-white font-medium text-base leading-6 mb-2">
            Title
          </p>
          <input
            type="text"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="Enter title"
            className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
          />
          {touched.title && errors.title && (
            <div className="text-red-500 text-sm">{errors.title}</div>
          )}
        </div>

        {/* Subject */}
        <div className="w-full">
          <p className="text-white font-medium text-base leading-6 mb-2">
            Subject
          </p>
          <input
            type="text"
            name="subject"
            value={values.subject}
            onChange={handleChange}
            placeholder="Enter subject"
            className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
          />
          {touched.subject && errors.subject && (
            <div className="text-red-500 text-sm">{errors.subject}</div>
          )}
        </div>

        {/* Optional: current file name(s) */}
        {editObjectData?.attachments && editObjectData.attachments.length > 0 && (
          <div className="text-sm text-gray-300">
            <p>Current files:</p>
            <div className="flex space-x-4 overflow-auto">
              {editObjectData.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {/* Image preview if it's an image */}
                  {attachment.type.startsWith("image/") && (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                  {/* For non-image files, just display the filename */}
                  {!attachment.type.startsWith("image/") && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {attachment.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files (optional, multiple) */}
        <div className="w-full">
          <p className="text-white font-medium text-base leading-6 mb-2">
            Replace / Add Files (optional)
          </p>
          <input
            type="file"
            name="files"
            multiple
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const list = e.currentTarget.files
                ? Array.from(e.currentTarget.files)
                : [];
              setFieldValue("files", list);
            }}
            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
            className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black file:mr-4 file:py-2 file:px-4 file:rounded-[4px] file:border-0 file:text-sm file:font-semibold file:bg-primary-700 file:text-white hover:file:bg-primary-800 pt-[6px]"
          />

          {/* Show per-field errors */}
          {touched.files && typeof errors.files === "string" && (
            <div className="text-red-500 text-sm text-center mt-1">
              {errors.files}
            </div>
          )}

          {/* Show per-file errors if any */}
          {Array.isArray(errors.files) && (
            <div className="text-red-500 text-sm mt-1">
              {errors.files.filter(Boolean).map((err, idx) => (
                <div key={idx}>{String(err)}</div>
              ))}
            </div>
          )}

          {/* Selected file list */}
          {values.files?.length > 0 && (
            <ul className="text-xs text-gray-300 space-y-1 mt-2">
              {values.files.map((f, i) => (
                <li key={i} className="flex justify-between">
                  <span className="truncate">{f.name}</span>
                  <span>
                    ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Body */}
        <div className="w-full">
          <p className="text-white font-medium text-base leading-6 mb-2">
            Body
          </p>
          <textarea
            name="body"
            value={values.body}
            onChange={handleChange}
            placeholder="Enter body"
            rows={4} // Adjust row count for a taller textarea if needed
            className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black pt-2"
          />
          {touched.body && errors.body && (
            <div className="text-red-500 text-sm">{errors.body}</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`py-[13px] px-[26px] w-full rounded-[4px] text-white text-center ${
            isSubmitting
              ? "bg-primary-700 opacity-60 cursor-not-allowed"
              : "bg-primary-700 hover:bg-primary-800"
          }`}
        >
          {isSubmitting ? "Updating..." : "Update Template"}
        </button>
      </div>
    </Form>
  )}
</Formik>


          </div>
        )}
      </div>

      {/* FITLER FLYOUT END */}
    </>
  );
}
