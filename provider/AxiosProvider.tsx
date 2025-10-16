import axios, {
  AxiosInstance,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import StorageManager from "./StorageManager";

const defaultBaseURL =
  "https://lead-crm-backend.dynsimulation.com/api/v1/managelead";

class AxiosProvider {
  private static instance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || defaultBaseURL,
  });

  // --- configure interceptors only once ---
  static {
    AxiosProvider.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const headers =
          config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers);

        if (typeof window !== "undefined") {
          const storage = new StorageManager();
          let token = storage.getAccessToken?.() || "";
          if (token.startsWith("Bearer ")) token = token.slice(7).trim();
          if (token) headers.set("Authorization", `Bearer ${token}`);
        }

        if (!headers.has("Accept")) headers.set("Accept", "application/json");
        if (!headers.has("Content-Type"))
          headers.set("Content-Type", "application/json");

        config.headers = headers;
        return config;
      }
    );

    AxiosProvider.instance.interceptors.response.use(
      (res) => res,
      (err) => Promise.reject(err)
    );
  }

  // --- static methods ---
  static get<T = any>(url: string, config?: AxiosRequestConfig) {
    return AxiosProvider.instance.get<T>(url, config);
  }

  static post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return AxiosProvider.instance.post<T>(url, data, config);
  }

  static put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return AxiosProvider.instance.put<T>(url, data, config);
  }

  static delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return AxiosProvider.instance.delete<T>(url, config);
  }
}

export default AxiosProvider;
