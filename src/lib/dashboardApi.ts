import api from "./api";

export const dashboardApi = {
  stats: () => api.get("companies/dashboard/stats/"),
  chat: (data: { message: string }) =>
    api.post("/chat/", data),
    
};