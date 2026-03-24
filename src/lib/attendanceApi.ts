import api from "./api";

export const attendanceApi = {
  list: () => api.get("/attendance/"),
  get:(id) => api.get(`/attendance/?employee_id=${id}/`)
};
