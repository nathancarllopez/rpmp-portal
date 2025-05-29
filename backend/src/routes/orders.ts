import express, { Request, Response } from "express";
import multer from "multer";
import parseOrders from "../business-logic/parseOrders";
import calculateOrderInfo from "../business-logic/calculateOrderInfo";
import generateOrderReport from "../business-logic/generateOrderReport";
import makeBackstockAdjustments from "../business-logic/makeBackstockAdjustments";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/process-orders",
  upload.single("orders"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const fileBuffer = req.file?.buffer;
      if (!fileBuffer) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const csvString = fileBuffer.toString("utf-8");
      const orders = await parseOrders(csvString);
      const { stats, orderErrors, ingredients } = calculateOrderInfo(orders);
      const { meals } = await makeBackstockAdjustments(ingredients);

      const report = generateOrderReport(orders, stats, meals, orderErrors);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment");

      report.pipe(res);
      report.end();
    } catch (error) {
      if (error instanceof Error) {
        console.warn("Error processing order: ", error.message);
      } else {
        console.warn("Unkown error processing order: ", JSON.stringify(error));
      }
      
      res.status(500).json({ error: "Failed to process orders" });
    }
  }
);

export default router;
