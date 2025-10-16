"use client";
import Image from "next/image";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
//import { AppContext } from "./AppContext";
import AxiosProvider from "../provider/AxiosProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import StorageManager from "../provider/StorageManager";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { constrainedMemory } from "process";
import Link from "next/link";
import UserActivityLogger from "../provider/UserActivityLogger";
import { isTokenExpired } from "./component/utils/authUtils";

const storage = new StorageManager();

interface FormValues {
  email: string;
  password: string;
}
export default function LoginHome() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const storage = new StorageManager();
  const aaaaa = storage.getAccessToken()


  const axiosProvider = new AxiosProvider();
  //const { setAccessToken } = useContext(AppContext);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
    terms: Yup.bool()
      .oneOf([true], "You must accept the Terms & Privacy Policy")
      .required("You must accept the Terms & Privacy Policy"),
  });

  const handleSubmitLogin = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await AxiosProvider.post("/sendotp", {
        email: values.email,
        password: values.password,
      });
      //console.log("LOG IN", res.data.data.role);
      storage.saveUserRole(res.data.data.role);

      // console.log(res.data.data.secretKey);
      // storage.saveUserId(res.data.data.id);
      // storage.saveUserSecretKey(res.data.data.secretKey);
      // storage.saveUserName(res.data.data.name);
      // await storage.saveUserPermissions(res.data.data.permissions);
      storage.saveUserEmail(values.email);
      // const activityLogger = new UserActivityLogger();
      //  await activityLogger.userLogin();
      toast.success("OTP Send on mail");
      router.push("/otp");
    } catch (error) {
      console.log(error);
      toast.error("Username or password is incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // const value = localStorage.getItem("accessToken");
  // value === null ?
  // console.log("OOOOOOOOOOOOOOO", value);
    useEffect(() => {
    const token = storage.getAccessToken(); // Get token from localStorage via StorageManager

    // If token exists and is not expired, redirect to dashboard
    if (token && !isTokenExpired(token)) {
      router.replace("/dashboard"); // Redirect to the Dashboard page
    }
  }, [router]);

  return (
    <>
      {/* <div className="bg-[#F5F5F5] hidden md:block">
        <Image
          src="/images/orizon-login-bg.svg"
          alt="Orizon iconLogo bg"
          width={100}
          height={100}
          className="w-full h-[100vh]"
        />
        <Image
          src="/images/orizonIcon.svg"
          alt="OrizonIcon"
          width={82}
          height={52}
          className=" absolute top-20 left-28"
        />
        <Image
          src="/images/orizonIcon.svg"
          alt="OrizonIcon"
          width={82}
          height={52}
          className=" absolute top-32 right-28"
        />
        <Image
          src="/images/orizonIcon.svg"
          alt="OrizonIcon"
          width={82}
          height={52}
          className=" absolute  top-1/2 left-[25%]"
        />
        <Image
          src="/images/orizonIcon.svg"
          alt="OrizonIcon"
          width={82}
          height={52}
          className=" absolute  top-[60%] right-[25%]"
        />
        <Image
          src="/images/orizonIcon.svg"
          alt="OrizonIcon"
          width={82}
          height={52}
          className=" absolute  top-[90%] right-0 left-0 mx-auto"
        />
      </div> */}
      <div className="absolute top-0 bottom-0 left-0 right-0 mx-auto my-auto w-[90%] max-w-[500px] h-[587px] shadow-loginBoxShadow  px-6 sm:px-12 py-10 sm:py-16 rounded-lg mainContainerBg">
        <Image
          src="/images/crmlogo.jpg"
          alt="OrizonIcon"
          width={82}
          height={52}
          className="mx-auto mb-5"
        />
        <p className="font-bold text-lg sm:text-base leading-normal text-center  mb-6">
          Login to LEAD CRM
        </p>
        <Formik
          initialValues={{ email: "", password: "", terms: false }}
          validationSchema={validationSchema}
          onSubmit={handleSubmitLogin}
        >
          {({ setFieldValue }) => (
            <Form className="w-full">
              <div className="w-full">
                {/* Email Field */}
                <p className=" text-base leading-normal mb-2">
                  Email
                </p>
                <div className="relative">
                  <Field
                    type="text"
                    name="email"
                    autoComplete="username"
                    placeholder="Enter your User ID/Email"
                    className="focus:outline-none w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px]  pl-4 mb-7 hover:shadow-hoverInputShadow focus:border-primary-500 bg-black"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm absolute top-14"
                  />
                </div>

                {/* Password Field */}
                <p className=" text-base leading-normal mb-2">
                  Password
                </p>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue("password", e.target.value)
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="focus:outline-none w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] pl-4 mb-8  hover:shadow-hoverInputShadow focus:border-primary-500 bg-black"
                  />
                  {showPassword ? (
                    <FaRegEye
                      onClick={togglePasswordVisibility}
                      className="absolute top-4 right-4  text-[15px] cursor-pointer"
                    />
                  ) : (
                    <FaRegEyeSlash
                      onClick={togglePasswordVisibility}
                      className="absolute top-4 right-4  text-[15px] cursor-pointer"
                    />
                  )}
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm absolute top-14"
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center mb-9 relative">
                  <Field
                    type="checkbox"
                    name="terms"
                    id="terms"
                    className="mt-0.5 mr-2 w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor="terms" className="text-sm ">
                    I agree to the{" "}
                    <a
                      href="/"
                      target="_blank"
                      className="underline text-primary-600"
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/"
                      target="_blank"
                      className="underline text-primary-600"
                    >
                      Privacy Policy
                    </a>
                  </label>
                  <ErrorMessage
                    name="terms"
                    component="div"
                    className="text-red-500 text-sm mb-3 absolute top-7"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 rounded-[4px] w-full h-[50px] text-center text-white text-lg font-medium leading-normal mb-3 hover:bg-primary-700 active:bg-primary-700 transition duration-100"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
