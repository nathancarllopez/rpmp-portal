import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import ordersRoutes from "./routes/orders";
// import getTable from './supabase/getTable';
import { supabase } from './supabase/client';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/orders', ordersRoutes);

app.get("/clean-up", async (req, res) => {
  await supabase.from('backstock').update({ 'available': true });
  res.send('done');
});

app.get("/health", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
