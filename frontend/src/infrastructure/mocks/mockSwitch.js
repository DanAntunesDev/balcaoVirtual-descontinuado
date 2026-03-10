import { API_CONFIG } from "@/infrastructure/api/apiConfig";

export const isMockMode = API_CONFIG.MODE === "mock";
