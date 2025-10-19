import React, { useEffect, useState } from 'react';
import AxiosProvider from '../../provider/AxiosProvider';
import { Formik, Field, Form } from "formik";
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

  const status = [
    { id: "hot-lead", name: "Hot lead" },
    { id: "no-connect", name: "No connect" },
    { id: "under-discussion", name: "Under Discussion" },
    { id: "not-interested", name: "Not interested" },
    { id: "agreement-send", name: "Agreement send" },
    { id: "signed-agreement-received", name: "Signed agreement received" },
    { id: "hold", name: "Hold" },
  ];

  // FETCH DROPDOWN DATA
  const leadSource = async () => {
    try {
      const response = await AxiosProvider.get("/leadsources");
      setLeadSourceData(response.data.data.data);
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
      const result = res.data?.data?.data ?? [];
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
      setConsolidationData(response.data.data.data);
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
      setDebtConsolidation(response.data.data.data);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    debtConsolidationStatus();
  }, []);
  // END FETCH

  const handleCreateLead = async (payload: any) => {
    console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",payload)
    return;
    try {
      await AxiosProvider.post("/leads", payload);
      toast.success("Lead is Created");
      closeFlyOut();
    } catch (error: any) {
      toast.error(error.response?.data?.msg ?? "Failed to create lead");
    }
  };

  // ======= SCHEMA =======
  // Accepts: 8888888888, +918888888888, +91 8888888888
  const IN_PHONE_RX = /^(\+91\s?)?[6-9][0-9]{9}$/;

  // Use .shape(...) for broader Yup compatibility
  const LeadSchema = Yup.object().shape({
    // REQUIRED
    full_name: Yup.string().trim().required("Full name is required"),
    email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
    phone: Yup.string()
      .transform((v, o) => (o ? o.replace(/\s+/g, "") : o)) // strip spaces before validating
      .trim()
      .required("Phone number is required")
      .test(
        "is-valid-phone",
        "Enter a valid phone number (with or without +91)",
        (value) => !!value && IN_PHONE_RX.test(value as string)
      ),

    // OPTIONAL
    whatsapp_number: Yup.string()
      .transform((v, o) => (o ? o.replace(/\s+/g, "") : o))
      .nullable()
      .notRequired()
      .test(
        "is-valid-whatsapp",
        "Enter a valid WhatsApp number (with or without +91)",
        (value) => !value || value === "" || IN_PHONE_RX.test(value as string)
      ),

    address_line1: Yup.string().nullable().notRequired(),
    state: Yup.string().nullable().notRequired(),        // Province / State (text)
    postal_code: Yup.string().nullable().notRequired(),
    best_time_to_call: Yup.string().nullable().notRequired(),

    lead_source_id: Yup.string().nullable().notRequired(),
    agent_id: Yup.string().nullable().notRequired(),

    company: Yup.string().nullable().notRequired(),
    status: Yup.string().nullable().notRequired(),
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
          company: "",
          status: "",
        }}
      //  validationSchema={LeadSchema}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={true}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          // Normalize numbers before sending (remove spaces)
          const normalize = (s?: string) => (s ? s.replace(/\s+/g, "") : s);

          const payload = {
            ...values,
            phone: normalize(values.phone),
            whatsapp_number: normalize(values.whatsapp_number),
          };

          handleCreateLead(payload);
          setSubmitting(false);
          resetForm();
        }}
      >
        {({ isSubmitting, isValid, values, setFieldValue, setFieldTouched }) => (
          <Form className="space-y-4">{/* <-- Formik's <Form> prevents nested-form issues */}
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

              {/* Province / State (text) */}
              <div>
                <p className="text-white mb-2">Province / State</p>
                <Field
                  type="text"
                  name="state"
                  placeholder="Enter Province / State"
                  className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
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

              {/* Company */}
              <div>
                <p className="text-white mb-2">Company</p>
                <Field
                  type="text"
                  name="company"
                  placeholder="Company name"
                  className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
                />
              </div>

              {/* Status */}
              <div>
                <p className="text-white mb-2">Status</p>
                <Select
                  value={status.find((opt) => opt.id === values.status) || null}
                  onChange={(selected: any) => setFieldValue("status", selected ? selected.id : "")}
                  onBlur={() => setFieldTouched("status", true)}
                  getOptionLabel={(opt: any) => opt.name}
                  getOptionValue={(opt: any) => opt.id}
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
              disabled={isSubmitting || !isValid}
              className="w-full py-3 bg-primary-600 rounded-[4px] text-white text-base font-medium hover:bg-primary-700"
            >
              {isSubmitting ? "Creating..." : "Create Leads"}
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default CreateLead;
