import httpClient from "@/infrastructure/api/httpClient";
import { handleApiError } from "@/infrastructure/api/errorHandler";

export const createService = (endpoint) => ({
  async list() {
    try {
      const { data } = await httpClient.get(endpoint);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async get(id) {
    try {
      const { data } = await httpClient.get(`${endpoint}/${id}`);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async create(payload) {
    try {
      const { data } = await httpClient.post(endpoint, payload);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async update(id, payload) {
    try {
      const { data } = await httpClient.put(`${endpoint}/${id}`, payload);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async remove(id) {
    try {
      const { data } = await httpClient.delete(`${endpoint}/${id}`);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
});
