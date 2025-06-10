import { Stack, Stepper, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import OrderUpload from "./-components/OrderUpload";
import OrderEditor from "./-components/OrderEditor";
import OrderDisplay from "./-components/OrderDisplay";

export const Route = createFileRoute("/_dashboard/orders")({
  component: OrdersComponent,
});

export const headerMapping: Record<string, string> = {
  firstName: "First Name (Shipping)",
  lastName: "Last Name (Shipping)",
  itemName: "Item Name",
  flavor: "Flavor",
  protein: "Tags",
  quantity: "Quantity",
};

export const flavorMapping: Record<string, string> = {
  "COMPETITOR-PREP (100% PLAIN-PLAIN)": "x",
  "BBQ CHICKEN (SUGAR FREE)": "bbq",
  BLACKENED: "blackened",
  "GARLIC AND HERB (As Described)": "garlicHerb",
  "HIMALAYAN PINK SALT AND PEPPER ONLY": "saltAndPepper",
  "LEMON PEPPER": "lemonPepper",
  "SPICY BEEF BISON": "spicy",
  "SPICY TERIYAKI BEEF BISON": "spicyTeriyaki",
  "SPICY TERIYAKI TURKEY": "spicyTeriyaki",
  "SPICY TURKEY": "spicy",
  "SRIRACHA CHICKEN (SPICY &amp; SWEET)": "sriracha",
  "STEAKHOUSE SHRIMP": "steakhouse",
  "STEAKHOUSE SIRLOIN": "steakhouse",
  "TASTY FAJITA": "fajita",
  "TERIYAKI (SUGAR FREE)": "teriyaki",
  "TWISTED CAJUN (As Described)": "twistedCajun",
  "TWISTED TERIYAKI": "twistedTeriyaki",
  "WILD'N SHRIMP (As Described)": "wildn",
  "ZEST'N LEMON": "zestn",
};

export interface Order {
  fullName: string;
  itemName: string;
  flavor: string;
  flavorLabel: string;
  protein: string;
  proteinLabel: string;
  quantity: number;
};

function OrdersComponent() {
  const [activeStep, setActiveStep] = useState(0);
  const [orderData, setOrderData] = useState<Order[] | null>(null);
  const [orderReportUrl, setOrderReportUrl] = useState<string | undefined>(
    undefined
  );

  // To do: Implement these helpers, and maybe put the steps into an array so that 2 isn't a magic number
  // const toNextStep = () => setActiveStep((curr) => Math.min(2, curr + 1));
  // const toPrevStep = () => setActiveStep((curr) => Math.max(0, curr - 1));

  return (
    <Stack>
      <Title>Orders</Title>

      <Stepper active={activeStep} allowNextStepsSelect={false}>
        <Stepper.Step label="Step 1" description="Upload order sheet">
          <OrderUpload
            setOrderData={setOrderData}
            setActiveStep={setActiveStep}
          />
        </Stepper.Step>
        <Stepper.Step label="Step 2" description="Edit order upload">
          {orderData ? (
            <OrderEditor
              orderData={orderData}
              setOrderData={setOrderData}
              setActiveStep={setActiveStep}
            />
          ) : (
            <Text>No order data provided</Text>
          )}
        </Stepper.Step>
        <Stepper.Step label="Step 3" description="Generate order print outs">
          <OrderDisplay
            orderReportUrl={orderReportUrl}
            setOrderReportUrl={setOrderReportUrl}
            setActiveStep={setActiveStep}
          />
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}
