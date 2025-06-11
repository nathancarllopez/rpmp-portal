import { createFileRoute } from '@tanstack/react-router'
import { Stack, Stepper, Text, Title } from "@mantine/core";
import { useState } from "react";
import OrderUpload from './-components/orders/OrderUpload';
import OrderEditor from './-components/orders/OrderEditor';
import OrderDisplay from './-components/orders/OrderDisplay';

export const Route = createFileRoute('/_dashboard/orders')({
  component: OrdersComponent,
})

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