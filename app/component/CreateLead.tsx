import React, { useEffect, useState } from 'react'
import AxiosProvider from '../../provider/AxiosProvider';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from 'react-toastify';

interface CreateLeadProps {
  closeFlyOut: () => void;
}

const CreateLead: React.FC<CreateLeadProps> = ({ closeFlyOut }) => {

// INTERFACES
 interface LeadSource {
  id: string;
  name: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
interface Consolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
interface DebtConsolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// END INTERFACES

  const [leadSourceData, setLeadSourceData] = useState<LeadSource[]>([]);
  const [agentList, setAgentList] = useState<Agent[]>([]);
   const [debtConsolidation, setDebtConsolidation] = useState<DebtConsolidation[]>([]);
 const [consolidationData, setConsolidationData] = useState<Consolidation[]>([]);
  // console.log("FFFFFFFFFFFFFFFFFFFFFFFF",debtConsolidation)
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

// USE EFFECT FOR FETCHING DROP DOWN DATA
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
    const fetchAgent = async () => {
      try {
        const res = await AxiosProvider.get("/allagents");
        // adjust this if your payload differs
       const  result= res.data?.data?.data ?? [];
        setAgentList(result);
      } catch (error: any) {
        console.error("Error fetching agents:", error);
        setAgentList([]);
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
//END  USE EFFECT FOR FETCHING DROP DOWN DATA
const handleCreateLead = async(payload: any)=>{
  //  console.log("VVVVVVVVVVVVVVVVVVVVV",payload)
    
    // setIsFilter(false);
   // setFlyoutOpen(false);
    //console.log("4444444444444444", value);
   // return;

    try {
      await AxiosProvider.post("/leads", payload);
      toast.success("Lead is Created");
      closeFlyOut()
     // setHitApi(!hitApi);
    } catch (error: any) {
      toast.error(error.response.data.msg);
    //  console.log("lead create error",error.response.data.msg)
    } 

}

// SCHEMA
  const LeadSchema = Yup.object({
    full_name: Yup.string().trim().required("Full name is required"),
    email: Yup.string()
      .trim()
      .email("Enter a valid email")
      .required("Email is required"),
    phone: Yup.string()
      .trim()
      .required("Phone number is required")
      .matches(
        /^(\+91)?[6-9][0-9]{9}$/,
        "Enter a valid phone number (with or without +91)"
      ),

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

    // Optional dropdown: show name, store id (can be empty)
    lead_source_id: Yup.string().nullable().notRequired(),
    debt_consolidation_status_id: Yup.string().nullable().notRequired(),
  });
  return (
    <>
<Formik
  initialValues={{
    full_name: "",
    email: "",
    phone: "",
    address_line1: "",
    state: "",
    postal_code: "",
    best_time_to_call: "",
    lead_source_id: "",
    whatsapp_number: "",
    agent_id: "",
    debt_consolidation_status_id: "",
    consolidated_credit_status_id: "",
  }}
  onSubmit={(values, { setSubmitting, resetForm }) => {
   // console.log("Form Values:", values);
    handleCreateLead(values)
    setSubmitting(false);
    resetForm();
  }}
>
  {({ handleSubmit, isSubmitting, values, setFieldValue, setFieldTouched }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <p className="text-white mb-2">Full Name</p>
          <Field
            type="text"
            name="full_name"
            placeholder="Alexandre Dumas"
            className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
          />
        </div>

        {/* Email */}
        <div>
          <p className="text-white mb-2">Email</p>
          <Field
            type="email"
            name="email"
            placeholder="alexandre@example.com"
            className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
          />
        </div>

        {/* Phone */}
        <div>
          <p className="text-white mb-2">Phone</p>
          <Field
            type="text"
            name="phone"
            placeholder="+91 9XXXXXXXXX"
            className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
          />
        </div>

        {/* Address Line 1 */}
        <div>
          <p className="text-white mb-2">Address Line 1</p>
          <Field
            type="text"
            name="address_line1"
            placeholder="Street, House no."
            className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
          />
        </div>

        {/* Province */}
        <div>
          <p className="text-white mb-2">Province</p>
          <Select
            value={provinceOptions.find((opt) => opt.id === values.state) || null}
            onChange={(selected: any) => setFieldValue("state", selected ? selected.id : "")}
            onBlur={() => setFieldTouched("state", true)}
            getOptionLabel={(opt: any) => opt.name}
            getOptionValue={(opt: any) => opt.id}
            options={provinceOptions}
            placeholder="Select Province"
            isClearable
                classNames={{
                control: ({ isFocused }: any) =>
                  `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                    isFocused ? "!border-primary-500" : "!border-gray-700"
                  }`,
              }}
              styles={{
                menu: (base) => ({ ...base, borderRadius: 4, backgroundColor: "#000" }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected ? "var(--primary-600)" : isFocused ? "#222" : "#000",
                  color: "#fff",
                  cursor: "pointer",
                }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "#aaa" }),
              }}
          />
        </div>

        {/* Postal Code */}
        <div>
          <p className="text-white mb-2">Postal Code</p>
          <Field
            type="text"
            name="postal_code"
            placeholder="400071"
            className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
          />
        </div>

        {/* Best Time to Call */}
        <div>
          <p className="text-white mb-2">Best Time to Call</p>
          <Field
            type="text"
            name="best_time_to_call"
            placeholder="e.g., 3–5 PM"
            className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
          />
        </div>

        {/* Lead Source */}
        <div>
          <p className="text-white mb-2">Lead Source</p>
          <Select
            value={leadSourceData.find((opt) => opt.id === values.lead_source_id) || null}
            onChange={(selected: any) => setFieldValue("lead_source_id", selected ? selected.id : "")}
            onBlur={() => setFieldTouched("lead_source_id", true)}
            getOptionLabel={(opt: any) => opt.name}
            getOptionValue={(opt: any) => opt.id}
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
                menu: (base) => ({ ...base, borderRadius: 4, backgroundColor: "#000" }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected ? "var(--primary-600)" : isFocused ? "#222" : "#000",
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
        <div>
          <p className="text-white mb-2">WhatsApp Number</p>
          <Field
            type="text"
            name="whatsapp_number"
            placeholder="+91 9XXXXXXXXX"
            className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
          />
        </div>

        {/* Assign to Agent */}
        <div>
          <p className="text-white mb-2">Assign to Agent</p>
          <Select
            value={agentList.find((opt) => opt.id === values.agent_id) || null}
            onChange={(selected: any) => setFieldValue("agent_id", selected ? selected.id : "")}
            onBlur={() => setFieldTouched("agent_id", true)}
            getOptionLabel={(opt: any) => opt.name}
            getOptionValue={(opt: any) => opt.id}
            options={agentList}
            placeholder="Select Agent"
            isClearable
                classNames={{
                control: ({ isFocused }: any) =>
                  `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                    isFocused ? "!border-primary-500" : "!border-gray-700"
                  }`,
              }}
              styles={{
                menu: (base) => ({ ...base, borderRadius: 4, backgroundColor: "#000" }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected ? "var(--primary-600)" : isFocused ? "#222" : "#000",
                  color: "#fff",
                  cursor: "pointer",
                }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "#aaa" }),
              }}
          />
        </div>

        {/* Debt Consolidation Status */}
        <div>
          <p className="text-white mb-2">Debt Consolidation Status</p>
          <Select
            value={debtConsolidation.find((opt) => opt.id === values.debt_consolidation_status_id) || null}
            onChange={(selected: any) =>
              setFieldValue("debt_consolidation_status_id", selected ? selected.id : "")
            }
            onBlur={() => setFieldTouched("debt_consolidation_status_id", true)}
            getOptionLabel={(opt: any) => opt.name}
            getOptionValue={(opt: any) => opt.id}
            options={debtConsolidation}
            placeholder="Select Debt Consolidation Status"
            isClearable
                classNames={{
                control: ({ isFocused }: any) =>
                  `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                    isFocused ? "!border-primary-500" : "!border-gray-700"
                  }`,
              }}
              styles={{
                menu: (base) => ({ ...base, borderRadius: 4, backgroundColor: "#000" }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected ? "var(--primary-600)" : isFocused ? "#222" : "#000",
                  color: "#fff",
                  cursor: "pointer",
                }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "#aaa" }),
              }}
          />
        </div>

        {/* Consolidated Credit Status */}
        <div>
          <p className="text-white mb-2">Consolidated Credit Status</p>
          <Select
            value={consolidationData.find((opt) => opt.id === values.consolidated_credit_status_id) || null}
            onChange={(selected: any) =>
              setFieldValue("consolidated_credit_status_id", selected ? selected.id : "")
            }
            onBlur={() => setFieldTouched("consolidated_credit_status_id", true)}
            getOptionLabel={(opt: any) => opt.name}
            getOptionValue={(opt: any) => opt.id}
            options={consolidationData}
            placeholder="Select Consolidated Credit Status"
            isClearable
                classNames={{
                control: ({ isFocused }: any) =>
                  `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-black !shadow-sm ${
                    isFocused ? "!border-primary-500" : "!border-gray-700"
                  }`,
              }}
              styles={{
                menu: (base) => ({ ...base, borderRadius: 4, backgroundColor: "#000" }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected ? "var(--primary-600)" : isFocused ? "#222" : "#000",
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


    </>
  )
}

export default CreateLead