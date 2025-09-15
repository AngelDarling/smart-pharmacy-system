import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// API test
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Pharmacy Backend 🚀" });
});

export default app;
