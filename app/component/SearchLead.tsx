"use client";

import React, { useEffect, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";

/** ====== Types ====== */
interface LeadSource {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string;
  updated_at: string;
}
interface Consolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
interface DebtConsolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  lead_source: string | null;
  lead_score: number | null;
  lead_quality: string | null;
  lead_age_days: number | string | null;
  lead_age_label: string | null;
  best_time_to_call: string | null;
  consolidated_credit_status: string | null;
  debt_consolidation_status: string | null;
  owner_name: string | null;
  created_at: string;
  created_at_ca?: string;
  updated_at: string;
  agent: { id: string; name: string } | null;
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  } | null;
}

interface SearchLeadProps {
  // used just to set table on first search if you want (optional)
  setSearchedData: React.Dispatch<React.SetStateAction<any[]>>;
  closeFlyOut: () => void;

  // parent pagination controls
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setTotalPage: React.Dispatch<React.SetStateAction<number>>;
  page: number;

  // NEW: tell parent the filters to use for pagination fetches
  onApplyFilters: (payload: Record<string, any>) => void;
}



/** ====== Static province list ====== */
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

const SearchLead: React.FC<SearchLeadProps> = ({
  setSearchedData,
  closeFlyOut,
  setPage,
  setTotalPage,
  page,
  onApplyFilters,
}) => {
  /** Dropdown data */
  const [leadSourceData, setLeadSourceData] = useState<LeadSource[]>([]);
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [debtConsolidation, setDebtConsolidation] = useState<DebtConsolidation[]>([]);
  const [consolidationData, setConsolidationData] = useState<Consolidation[]>([]);
  const [loading, setLoading] = useState(false);

  /** Fetch dropdowns once */
  useEffect(() => {
    (async () => {
      try {
        const [ls, ag, cons, debt] = await Promise.all([
          AxiosProvider.get("/leadsources"),
          AxiosProvider.get("/allagents"),
          AxiosProvider.get("/getconsolidation"),
          AxiosProvider.get("/leaddebtstatuses"),
        ]);

        setLeadSourceData(ls?.data?.data?.data ?? []);
        setAgentList(ag?.data?.data?.data ?? []);
        setConsolidationData(cons?.data?.data?.data ?? []);
        setDebtConsolidation(debt?.data?.data?.data ?? []);
      } catch (err) {
        console.error("Dropdown fetch failed:", err);
        toast.error("Failed to load filters.");
      }
    })();
  }, []);

  /** Normalize: empty strings -> undefined; trim strings; keep arrays intact */
  const normalize = (obj: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (Array.isArray(v)) out[k] = v.length ? v : undefined;
      else if (v === "") out[k] = undefined;
      else if (typeof v === "string") out[k] = v.trim() === "" ? undefined : v.trim();
      else out[k] = v;
    });
    return out;
  };

  /** First search handler: emit filters to parent and let parent fetch page=1 */
  const performInitialSearch = async (payload: Record<string, any>) => {
    try {
      setLoading(true);

      // parent will own fetching; but we can optionally kick off the first fetch here:
      // leave it to parent entirely:
      // 1) reset to first page
      setPage(1);

      // 2) tell parent to remember filters and fetch page 1
      onApplyFilters(payload);

      // Optional: close after search
      closeFlyOut();
    } finally {
      setLoading(false);
    }
  };

  /** Yup schema */
  const SearchSchema = Yup.object()
    .shape({
      full_name: Yup.string().trim().optional(),
      email: Yup.string().trim().email("Enter a valid email").optional(),
      phone: Yup.string()
        .trim()
        .matches(/^(\+91)?[0-9]{7,14}$/, "Enter a valid phone (with/without +91)")
        .optional(),
      whatsapp_number: Yup.string()
        .trim()
        .matches(/^(\+91)?[0-9]{7,14}$/, "Enter a valid WhatsApp (with/without +91)")
        .optional(),
      state: Yup.string().optional(),
      lead_source_id: Yup.string().optional(),
      agent_ids: Yup.array().of(Yup.string()).optional(),
      debt_consolidation_status_id: Yup.string().optional(),
      consolidated_credit_status_id: Yup.string().optional(),
    })
    .test("at-least-one", "Enter at least one field to search.", (values) => {
      if (!values) return false;
      const keys = [
        "full_name",
        "email",
        "phone",
        "whatsapp_number",
        "state",
        "lead_source_id",
        "debt_consolidation_status_id",
        "consolidated_credit_status_id",
      ];
      const anyScalar = keys.some((k) => {
        const v = (values as any)[k];
        return v !== undefined && v !== null && String(v).trim() !== "";
      });
      const anyAgents =
        Array.isArray((values as any).agent_ids) && (values as any).agent_ids.length > 0;
      return anyScalar || anyAgents;
    });

  return (
    <Formik
      initialValues={{
        full_name: "",
        email: "",
        phone: "",
        whatsapp_number: "",
        state: "",
        lead_source_id: "",
        agent_ids: [] as string[],
        debt_consolidation_status_id: "",
        consolidated_credit_status_id: "",
      }}
      validationSchema={SearchSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const payload = normalize(values);
        await performInitialSearch(payload);
        setSubmitting(false);
      }}
    >
      {({ handleSubmit, isSubmitting, values, setFieldValue, setFieldTouched }) => (
        <Form onSubmit={handleSubmit} className="space-y-4">
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

            {/* WhatsApp */}
            <div>
              <p className="text-white mb-2">WhatsApp Number</p>
              <Field
                type="text"
                name="whatsapp_number"
                placeholder="+91 9XXXXXXXXX"
                className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
              />
            </div>

            {/* Province / State */}
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

            {/* Lead Source */}
            <div>
              <p className="text-white mb-2">Lead Source</p>
              <Select
                value={leadSourceData.find((opt) => opt.id === values.lead_source_id) || null}
                onChange={(selected: any) =>
                  setFieldValue("lead_source_id", selected ? selected.id : "")
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

            {/* Agents (MULTI) */}
            <div>
              <p className="text-white mb-2">Agents</p>
              <Select
                isMulti
                value={agentList.filter((opt) => values.agent_ids.includes(opt.id))}
                onChange={(selected: any) => {
                  const ids = (selected ?? []).map((o: any) => o.id);
                  setFieldValue("agent_ids", ids);
                }}
                onBlur={() => setFieldTouched("agent_ids", true)}
                getOptionLabel={(opt: any) => opt.name}
                getOptionValue={(opt: any) => opt.id}
                options={agentList}
                placeholder="Select one or more agents"
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
                value={
                  debtConsolidation.find(
                    (opt) => opt.id === values.debt_consolidation_status_id
                  ) || null
                }
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
                value={
                  consolidationData.find(
                    (opt) => opt.id === values.consolidated_credit_status_id
                  ) || null
                }
                onChange={(selected: any) =>
                  setFieldValue(
                    "consolidated_credit_status_id",
                    selected ? selected.id : ""
                  )
                }
                onBlur={() =>
                  setFieldTouched("consolidated_credit_status_id", true)
                }
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

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-5 py-3 bg-primary-600 rounded-[4px] text-white text-base font-medium hover:bg-primary-700 disabled:opacity-50 w-full"
            >
              {(isSubmitting || loading) ? "Searching..." : "Search"}
            </button>

            <button
              type="reset"
              className="px-5 py-3 bg-gray-800 border border-gray-700 rounded-[4px] text-white text-base font-medium hover:bg-gray-700 w-full"
              onClick={() => {
                // nothing special; parent will clear if needed
              }}
            >
              Clear
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SearchLead;
