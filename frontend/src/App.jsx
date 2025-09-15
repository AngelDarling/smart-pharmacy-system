import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
  axios.get("/api/hello")
    .then((res) => setMessage(res.data.message))
    .catch(() => setMessage("⚠️ Lỗi kết nối API"));
}, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>💊 Smart Pharmacy System (Frontend)</h1>
      <p>API Response từ Backend:</p>
      <h2 style={{ color: "green" }}>{message}</h2>
    </div>
  );
}

export default App;
