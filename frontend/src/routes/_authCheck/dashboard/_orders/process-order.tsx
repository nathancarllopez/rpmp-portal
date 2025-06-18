import { useRef, useState } from "react";
import type { OrderReportInfo } from "@rpmp-portal/types";
import LoadingScreen from "@/components/misc/LoadingScreen";
import { Button, Stack, Stepper, Text, Title } from "@mantine/core";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { OrderEditor } from "@/components/dashboard/orders/OrderEditor";
import ReportDisplay from "@/components/dashboard/orders/ReportDisplay";
import NavigationBlockAlert from "@/components/misc/NavigationBlockAlert";
import { OrderDropzone } from "@/components/dashboard/orders/OrderDropzone";
import ReportCalculator from "@/components/dashboard/orders/ReportCalculator";
import { flavorsOptions } from "@/integrations/tanstack-query/queries/flavors";
import { proteinsOptions } from "@/integrations/tanstack-query/queries/proteins";
import { backstockOptions } from "@/integrations/tanstack-query/queries/backstock";
import { orderHeadersOptions } from "@/integrations/tanstack-query/queries/orderHeaders";
import { proteinsAndFlavorsOptions } from "@/integrations/tanstack-query/queries/proteinsWithFlavors";
import { veggieCarbInfoOptions } from "@/integrations/tanstack-query/queries/veggieCarbInfo";
import { pullListOptions } from "@/integrations/tanstack-query/queries/pullList";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/integrations/tanstack-query/root-provider";

export const Route = createFileRoute(
  "/_authCheck/dashboard/_orders/process-order"
)({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(orderHeadersOptions());
    queryClient.ensureQueryData(proteinsOptions());
    queryClient.ensureQueryData(flavorsOptions());
    queryClient.ensureQueryData(proteinsAndFlavorsOptions());
    queryClient.ensureQueryData(backstockOptions());
    queryClient.ensureQueryData(veggieCarbInfoOptions());
    queryClient.ensureQueryData(pullListOptions());
  },
  pendingComponent: LoadingScreen,
  component: OrderProcessor,
});

function OrderProcessor() {
  const [active, setActive] = useState(0);
  const [orderReportInfo, setOrderReportInfo] = useState<OrderReportInfo>(() =>
    getBlankOrderReportInfo()
  );
  const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

  const resetCalculatedInfo = () =>
    setOrderReportInfo((curr) => {
      const { orderData } = curr;
      const blank = getBlankOrderReportInfo();

      return { ...blank, orderData };
    });

  const processingCompleteRef = useRef(false);
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => active > 1 && !processingCompleteRef.current,
    withResolver: true,
  });

  const stepProps: Record<string, Record<string, string>> = {
    dropzone: { label: "Step 1", description: "Upload order sheet" },
    edit: { label: "Step 2", description: "Edit order upload" },
    calculate: { label: "Step 3", description: "Generate order report" },
    display: {
      label: "Complete",
      description: "Download report and save changes",
    },
  };
  const numSteps = Object.keys(stepProps).length;

  const toNextStep = () =>
    setActive((curr) => Math.min(numSteps - 1, curr + 1));
  const toPrevStep = () => setActive((curr) => Math.max(0, curr - 1));
  const jumpToStep = (step: number) =>
    setActive(step < 0 ? 0 : step > numSteps - 1 ? numSteps - 1 : step);

  return (
    <Stack>
      <NavigationBlockAlert
        opened={status === "blocked"}
        proceed={proceed}
        reset={reset}
        text={{
          title: "Wait stop!",
          message: "If you leave now all will be lost!",
        }}
      />

      <Title>Process Order</Title>

      <Stepper active={active} allowNextStepsSelect={false}>
        <Stepper.Step {...stepProps.dropzone}>
          <OrderDropzone
            setOrderReportInfo={setOrderReportInfo}
            toNextStep={toNextStep}
          />
        </Stepper.Step>
        <Stepper.Step {...stepProps.edit}>
          {orderReportInfo.orderData.length > 0 ? (
            <OrderEditor
              orderReportInfo={orderReportInfo}
              setOrderReportInfo={setOrderReportInfo}
              toNextStep={toNextStep}
              toPrevStep={toPrevStep}
            />
          ) : (
            <Text>No order data provided</Text>
          )}
        </Stepper.Step>
        <Stepper.Step {...stepProps.calculate}>
          {orderReportInfo.orderData.length > 0 ? (
            <ReportCalculator
              orderReportInfo={orderReportInfo}
              setOrderReportInfo={setOrderReportInfo}
              setReportUrl={setReportUrl}
              toNextStep={toNextStep}
            />
          ) : (
            <Text>No order data provided</Text>
          )}
        </Stepper.Step>
        <Stepper.Completed {...stepProps.display}>
          {reportUrl ? (
            <ReportDisplay
              orderReportInfo={orderReportInfo}
              resetCalculatedInfo={resetCalculatedInfo}
              reportUrl={reportUrl}
              setReportUrl={setReportUrl}
              jumpToStep={jumpToStep}
              processingCompleteRef={processingCompleteRef}
            />
          ) : (
            <Text>No report url provided</Text>
          )}
        </Stepper.Completed>
      </Stepper>

      <Button onClick={resetBackstock}>Reset Backstock</Button>
    </Stack>
  );
}

function getBlankOrderReportInfo(): OrderReportInfo {
  return {
    orderData: [],
    stats: {
      orders: 0,
      mealCount: 0,
      veggieMeals: 0,
      thankYouBags: 0,
      totalProteinWeight: 0,
      teriyakiCuppyCount: 0,
      extraRoastedVeggies: 0,
      proteinCubes: {},
      containers: {},
      proteins: {},
      veggieCarbs: {},
    },
    orderErrors: [],
    meals: [],
    usedBackstockIds: new Set<number>(),
    pullListDatas: [],
  };
}


async function resetBackstock() {
  const { data, error } = await supabase
    .from("backstock_proteins")
    .update({ available: true, deleted_on: null })
    .gt('id', 0);

  queryClient.invalidateQueries({ queryKey: ["backstock"] }),

  console.log(data);
  console.log(error);
  
  console.log("done");
}

// import { useRef, useState } from "react";
// import type { Order } from "@rpmp-portal/types";
// import LoadingScreen from "@/components/misc/LoadingScreen";
// import { Stack, Stepper, Text, Title } from "@mantine/core";
// import { createFileRoute, useBlocker } from "@tanstack/react-router";
// import { OrderEditor } from "@/components/dashboard/orders/OrderEditor";
// import ReportDisplay from "@/components/dashboard/orders/ReportDisplay";
// import NavigationBlockAlert from "@/components/misc/NavigationBlockAlert";
// import { OrderDropzone } from "@/components/dashboard/orders/OrderDropzone";
// import ReportCalculator from "@/components/dashboard/orders/ReportCalculator";
// import { flavorsOptions } from "@/integrations/tanstack-query/queries/flavors";
// import { proteinsOptions } from "@/integrations/tanstack-query/queries/proteins";
// import { backstockOptions } from "@/integrations/tanstack-query/queries/backstock";
// import { orderHeadersOptions } from "@/integrations/tanstack-query/queries/orderHeaders";
// import { proteinsAndFlavorsOptions } from "@/integrations/tanstack-query/queries/proteinsWithFlavors";
// import { veggieCarbInfoOptions } from "@/integrations/tanstack-query/queries/veggieCarbInfo";
// import { pullListOptions } from "@/integrations/tanstack-query/queries/pullList";

// export const Route = createFileRoute(
//   "/_authCheck/dashboard/_orders/process-order"
// )({
//   loader: ({ context: { queryClient } }) => {
//     queryClient.ensureQueryData(orderHeadersOptions());
//     queryClient.ensureQueryData(proteinsOptions());
//     queryClient.ensureQueryData(flavorsOptions());
//     queryClient.ensureQueryData(proteinsAndFlavorsOptions());
//     queryClient.ensureQueryData(backstockOptions());
//     queryClient.ensureQueryData(veggieCarbInfoOptions());
//     queryClient.ensureQueryData(pullListOptions());
//   },
//   pendingComponent: LoadingScreen,
//   component: OrderProcessor,
// });

// function OrderProcessor() {
//   const [active, setActive] = useState(0);
//   const [orderData, setOrderData] = useState<Order[] | null>(null);
//   const [initialOrderData, setInitialOrderData] = useState<Order[] | null>(
//     null
//   );
//   const [usedBackstockIds, setUsedBackstockIds] = useState<Set<number>>(new Set());
//   const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

//   const processingCompleteRef = useRef(false);

//   const { proceed, reset, status } = useBlocker({
//     shouldBlockFn: () => active > 1 && !processingCompleteRef.current,
//     withResolver: true,
//   });

//   const stepProps: Record<string, Record<string, string>> = {
//     dropzone: { label: "Step 1", description: "Upload order sheet" },
//     edit: { label: "Step 2", description: "Edit order upload" },
//     calculate: { label: "Step 3", description: "Generate order report" },
//     display: {
//       label: "Complete",
//       description: "Download report and save changes",
//     },
//   };
//   const numSteps = Object.keys(stepProps).length;

//   const toNextStep = () =>
//     setActive((curr) => Math.min(numSteps - 1, curr + 1));
//   const toPrevStep = () => setActive((curr) => Math.max(0, curr - 1));
//   const jumpToStep = (step: number) =>
//     setActive(step < 0 ? 0 : step > numSteps - 1 ? numSteps - 1 : step);

//   return (
//     <Stack>
//       <NavigationBlockAlert
//         opened={status === "blocked"}
//         proceed={proceed}
//         reset={reset}
//         text={{
//           title: "Wait stop!",
//           message: "If you leave now all will be lost!",
//         }}
//       />

//       <Title>Process Order</Title>

//       <Stepper active={active} allowNextStepsSelect={false}>
//         <Stepper.Step {...stepProps.dropzone}>
//           <OrderDropzone
//             setOrderData={setOrderData}
//             setInitialOrderData={setInitialOrderData}
//             toNextStep={toNextStep}
//           />
//         </Stepper.Step>
//         <Stepper.Step {...stepProps.edit}>
//           {orderData && initialOrderData ? (
//             <OrderEditor
//               orderData={orderData}
//               setOrderData={setOrderData}
//               initialOrderData={initialOrderData}
//               setInitialOrderData={setInitialOrderData}
//               toNextStep={toNextStep}
//               toPrevStep={toPrevStep}
//             />
//           ) : (
//             <Text>No order data provided</Text>
//           )}
//         </Stepper.Step>
//         <Stepper.Step {...stepProps.calculate}>
//           {orderData ? (
//             <ReportCalculator
//               orderData={orderData}
//               setReportUrl={setReportUrl}
//               setUsedBackstockIds={setUsedBackstockIds}
//               toNextStep={toNextStep}
//             />
//           ) : (
//             <Text>No order data provided</Text>
//           )}
//         </Stepper.Step>
//         <Stepper.Completed {...stepProps.display}>
//           {reportUrl ? (
//             <ReportDisplay
//               usedBackstockIds={usedBackstockIds}
//               setUsedBackstockIds={setUsedBackstockIds}
//               reportUrl={reportUrl}
//               setReportUrl={setReportUrl}
//               jumpToStep={jumpToStep}
//               processingCompleteRef={processingCompleteRef}
//             />
//           ) : (
//             <Text>No report url provided</Text>
//           )}
//         </Stepper.Completed>
//       </Stepper>
//     </Stack>
//   );
// }
