import api from "./api";

export const dashboardApi = {
  stats: () => api.get("companies/dashboard/stats/"),
};