import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/route";
import ordersRoutes from "./routes/orders";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);

app.get("/health", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
