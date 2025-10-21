"use client";
import Image from "next/image";
import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AxiosProvider from "../../provider/AxiosProvider";
import StorageManager from "../../provider/StorageManager";
import { AppContext } from "../AppContext";
import UserActivityLogger from "../../provider/UserActivityLogger";
import OtpInput from "react-otp-input";
import { isTokenExpired } from "../component/utils/authUtils";
import { messaging } from "../firebase-config";
import { getToken } from "firebase/messaging";

const axiosProvider = new AxiosProvider();

export default function OtpHome() {
  const storage = new StorageManager();
  const router = useRouter();
  const userEmail = storage.getUserEmail();

  const [loading, setLoading] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | undefined>();
  const [secretKey, setSecretKey] = useState<string | null>(
    storage.getDecryptedUserSecretKey()
  );
  const [userId, setuserId] = useState<string | undefined>(storage.getUserId());
  const [otp, setOtp] = useState<string>("");
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { setAccessToken } = useContext(AppContext);

  const handleChange = (val: string) => setOtp(val);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      setLoading(false);
      requestAnimationFrame(() => firstInputRef.current?.focus()); // 👈 add this
      return;
    }

    try {
      const res = await AxiosProvider.post("/login", {
        email: userEmail,
        otp: otp,
      });
      //  console.log("LOGIN SUCCESS", res.data.data.system_user_id);
      // setAccessToken(res.data.data.token);
      // storage.saveAccessToken(res.data.data.token);
      //  expiryTokenafter24Hour();
      //localStorage.setItem("authToken", res.data.data.token);
      await storage.saveAccessToken(res.data.data.token);
      await storage.saveUserId(res.data.data.system_user_id);
      toast.success("Login Successful");
      router.push("/dashboard");
      setIsLogged(true);
      const activityLogger = new UserActivityLogger();
      // await activityLogger.userLogin();
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Invalid Code. Please try again.");
      setOtp("");
      requestAnimationFrame(() => firstInputRef.current?.focus()); // 👈 add this
    } finally {
      setLoading(false);
    }
  };

  //   useEffect(() => {
  //   const token = storage.getAccessToken();
  //   if (token && token !== "null") router.replace("/dashboard");
  // }, []);

  useEffect(() => {
    const token = storage.getAccessToken(); // Get token from localStorage via StorageManager

    // If token exists and is not expired, redirect to dashboard
    if (token && !isTokenExpired(token)) {
      router.replace("/dashboard"); // Redirect to the Dashboard page
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const registerFCMToken = async () => {
        if (isLogged) {
          try {
            const currentToken = await getToken(messaging, {
              vapidKey:
                "BPGmALJgnU2asXN4pqtYf85enB-Y3KbCkCwmSmxtSE3nWT69ghqbFAvIYxRsqntM6oR4jJTCpnpngmXIlJ7ik_k", // Replace with your actual VAPID Key
            });

            if (currentToken) {
              const response = await AxiosProvider.post("/register-fcm", {
                fcmtoken: currentToken,
              });
              console.log("FCM Token registered", response.data);
            } else {
              console.log("No registration token available");
            }
          } catch (err) {
            console.error(
              "Error fetching FCM token or registering FCM token",
              err
            );
          }
        }
      };

      registerFCMToken();
    }
  }, [isLogged]);

  return (
    <>
      <div className="absolute top-0 bottom-0 left-0 right-0 mx-auto my-auto w-[90%] max-w-[500px] h-[587px] shadow-loginBoxShadow  px-6 sm:px-12 py-10 sm:py-16 rounded-lg mainContainerBg">
        <Image
          src="/images/crmlogo.jpg"
          alt="OrizonIcon"
          width={82}
          height={52}
          className="mx-auto mb-5"
        />
        <p className="font-bold text-lg sm:text-base leading-normal text-center  mb-2">
          Verify your email
        </p>
        {/* <button onClick={() => setIsLogged(true)}>FCM</button> */}
        {qrCode && (
          <Image
            src={qrCode}
            alt="QR Code"
            width={100}
            height={100}
            className="mx-auto"
          />
        )}
        <p className=" text-base leading-[26px] text-center mb-10 sm:mb-14">
          We&apos;ve sent you a one-time password (OTP). Please enter it below
          to confirm your account.
        </p>
        <form onSubmit={handleSubmit} className="w-full">
          <div>
            <div className="flex items-center justify-between mb-10 sm:mb-14 w-[96%] mx-auto">
              <OtpInput
                value={otp}
                onChange={handleChange}
                numInputs={6}
                shouldAutoFocus
                inputType="tel"
                containerStyle={{ display: "contents" }}
                renderInput={(props, index) => {
                  const { onChange, onKeyDown, ...rest } = props;
                  return (
                    <input
                      {...rest}
                      ref={index === 0 ? firstInputRef : undefined}
                      data-otp-index={index}
                      autoComplete="one-time-code"
                      onChange={(e) => {
                        onChange?.(e as any);
                        if (e.currentTarget.value.length === 1) {
                          const next = document.querySelector<HTMLInputElement>(
                            `input[data-otp-index="${index + 1}"]`
                          );
                          next?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        (onKeyDown as any)?.(e);
                        if (e.key === "Backspace" && !e.currentTarget.value) {
                          const prev = document.querySelector<HTMLInputElement>(
                            `input[data-otp-index="${index - 1}"]`
                          );
                          prev?.focus();
                        }
                      }}
                      className="!w-[14%] md:!w-[55px] h-12 sm:h-14 py-3 sm:py-4 text-center sm:px-5 border-b border-[#BDD1E0] text-white text-lg sm:text-xl font-semibold leading-normal focus:outline-none focus:border-b-2 focus-within:border-primary-500 bg-black"
                    />
                  );
                }}
              />
            </div>

            <div className="w-full">
              <button
                type="submit"
                className="bg-primary-600 border rounded-[4px] w-full h-[50px] text-center text-white text-lg font-medium leading-normal mb-3 hover:bg-primary-700 active:bg-primary-700"
                disabled={loading}
              >
                {loading ? "OTP Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
