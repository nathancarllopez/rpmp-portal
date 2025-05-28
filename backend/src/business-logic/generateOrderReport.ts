import PDFDocumentWithTables from "pdfkit-table";
import { Meal, Order, OrderError, OrderStatistics } from "./types";

export default function generateOrderReport(
  orders: Order[],
  stats: OrderStatistics,
  meals: Meal[],
  orderErrors: OrderError[]
): PDFDocumentWithTables {
  const report = new PDFDocumentWithTables({
    layout: "landscape",
  });

  if (orderErrors.length > 0) {
    addErrors(report, orderErrors);
    report.addPage();
  }

  addSummary(report, stats);
  report.addPage();
  addMeals(report, meals);
  report.addPage();
  addOrders(report, orders);

  return report;
}

function addErrors(report: PDFDocumentWithTables, orderErrors: OrderError[]) {
  // Title
  report.fontSize(16).text("Errors", { align: "center" });
  report.moveDown();

  // Date in subtitle
  report
    .fontSize(10)
    .text(new Date().toLocaleDateString(), { align: "center" });
  report.moveDown();
  report.fontSize(12);

  report.table({
    headers: [
      { label: "Full Name", property: "fullName", width: 100 },
      { label: "Order Info", property: "orderInfo", width: 250 },
      { label: "Issue", property: "issue", width: 250 },
    ],
    datas: orderErrors.map((oError) => {
      const { message, order } = oError;
      return {
        fullName: order.fullName,
        orderInfo: `${order.protein}: ${order.flavor} (${order.quantity})`,
        issue: message,
      };
    }),
  });
}

function addSummary(report: PDFDocumentWithTables, stats: OrderStatistics) {
  // Title
  report.fontSize(16).text("Summary", { align: "center" });
  report.moveDown();

  // Date in subtitle
  report
    .fontSize(10)
    .text(new Date().toLocaleDateString(), { align: "center" });
  report.moveDown();
  report.fontSize(12);

  // Statistics
  report.table(
    {
      headers: [
        { label: "Total Orders", property: "orders" },
        { label: "Total Meals", property: "meals" },
        { label: "Total Veggie Meals", property: "veggieMeals" },
      ],
      datas: [
        {
          orders: stats.orders.toString(),
          meals: stats.meals.toString(),
          veggieMeals: stats.veggieMeals.toString(),
        },
      ],
    },
    { title: "Statistics" }
  );
  report.moveDown();

  // Containers
  report.table(
    {
      headers: [
        { label: "2.5oz", property: "2.5oz" },
        { label: "4oz", property: "4oz" },
        { label: "6oz", property: "6oz" },
        { label: "8oz", property: "8oz" },
        { label: "10oz", property: "10oz" },
        { label: "Bulk", property: "bulk" },
      ],
      datas: [
        {
          "2.5oz": stats.containers["2.5oz"].toString(),
          "4oz": stats.containers["4oz"].toString(),
          "6oz": stats.containers["6oz"].toString(),
          "8oz": stats.containers["8oz"].toString(),
          "10oz": stats.containers["10oz"].toString(),
          bulk: stats.containers["bulk"].toString(),
        },
      ],
    },
    { title: "Containers" }
  );
}

function addMeals(report: PDFDocumentWithTables, meals: Meal[]) {
  // Title
  report.fontSize(16).text("Meals", { align: "center" });
  report.moveDown();

  // Date in subtitle
  report
    .fontSize(10)
    .text(new Date().toLocaleDateString(), { align: "center" });
  report.moveDown();
  report.fontSize(12);

  // Ingredients
  report.table(
    {
      headers: [
        { label: "Protein", property: "protein", width: 100 },
        { label: "Flavor", property: "flavor", width: 100 },
        {
          label: "Weight (oz)",
          property: "weightOz",
          width: 100,
          align: "right",
        },
        {
          label: "Weight (lb-oz)",
          property: "weightLbOz",
          width: 100,
          align: "right",
        },
        {
          label: "Cooked Weight (lb-oz)",
          property: "cookedWeightOz",
          width: 100,
          align: "right",
        },
        {
          label: "Backstock (oz)",
          property: "backstockWeight",
          width: 100,
          align: "right",
        },
      ],
      datas: meals.map((meal) => {
        return {
          ...meal,
          weightOz: `${meal.weightOz} oz`,
          backstockWeight: `${meal.backstockWeight} oz`,
          cookedWeightOz: `${meal.cookedWeightOz} oz`,
        };
      }),
    },
    {}
  );
}

function addOrders(report: PDFDocumentWithTables, orders: Order[]) {
  // Title
  report.fontSize(16).text("Orders", { align: "center" });
  report.moveDown();

  // Date in subtitle
  report
    .fontSize(10)
    .text(new Date().toLocaleDateString(), { align: "center" });
  report.moveDown();
  report.fontSize(12);

  // Orders
  report.table({
    headers: [
      { label: "Full Name", property: "fullName", width: 100 },
      { label: "Item Name", property: "itemName", width: 300 },
      { label: "Quantity", property: "quantity", width: 50, align: "center" },
      { label: "Protein", property: "protein", width: 75 },
      { label: "Flavor", property: "flavor", width: 150 },
    ],
    datas: orders.map((order) => {
      return {
        ...order,
        quantity: order.quantity.toString(),
      };
    }),
  });
}

function addCookSheet(report: PDFDocumentWithTables) {}
