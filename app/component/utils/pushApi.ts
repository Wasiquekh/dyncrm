
import AxiosProvider from "@/provider/AxiosProvider";

export async function registerPushToken(fcmtoken: string) {
  // /register-fcm is protected by requireAuth on backend (your axios sets Authorization automatically)
  await AxiosProvider.post("/register-fcm", { fcmtoken });
}
