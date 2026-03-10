import axios from "axios";
import { API_CONFIG } from "./apiConfig";
import { attachInterceptors } from "./interceptors";

const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

attachInterceptors(httpClient);

export default httpClient;
