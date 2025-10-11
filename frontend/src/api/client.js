import axios from "axios";

// Lightweight axios client; interceptors can be added later if needed

const api = axios.create({ baseURL: "http://localhost:5000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data.url; // returns path like /uploads/filename
}


