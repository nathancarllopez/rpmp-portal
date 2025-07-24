import { useInsertOrderHistoryMutation } from "@/integrations/tanstack-query/mutations/insertOrder";
import { useMarkBackstockUnavailableMutation } from "@/integrations/tanstack-query/mutations/markBackstockUnavailable";
import { Box, Button, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { InsertOrderHistoryRow, OrderReportInfo } from "@rpmp-portal/types";
import { getRouteApi } from "@tanstack/react-router";

interface OrderDisplayProps {
  orderReportInfo: OrderReportInfo;
  resetCalculatedInfo: () => void;
  reportUrl: string;
  setReportUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  jumpToStep: (step: number) => void;
  processingCompleteRef: React.RefObject<boolean>;
}

export default function ReportDisplay({
  orderReportInfo,
  resetCalculatedInfo,
  reportUrl,
  setReportUrl,
  jumpToStep,
  processingCompleteRef
}: OrderDisplayProps) {
  const markBackstockMutation = useMarkBackstockUnavailableMutation();
  const insertOrderHistoryMutation = useInsertOrderHistoryMutation();

  const { userId } = getRouteApi("/_authCheck/dashboard/_orders/process-order").useRouteContext();
  if (userId === null) {
    throw new Error("UserId missing in ReportDisplay");
  }

  const handleBackClick = () => {
    resetCalculatedInfo();
    setReportUrl(undefined);
    jumpToStep(1);
  };

  const handleSaveDownloadClick = () => {
    let noBackstockError = true;

    markBackstockMutation.mutate(orderReportInfo.usedBackstockIds, {
      onSuccess: () => {
        notifications.show({
          withCloseButton: true,
          color: "green",
          title: "Backstock Rows Updated!",
          message: "The backstock has been updated",
        });
      },
      onError: (error) => {
        noBackstockError = false;
        console.warn("Error saving changes: ", error.message);
        notifications.show({
          withCloseButton: true,
          color: "red",
          title: "Changes not saved",
          message: error.message,
        });
      },
    });

    if (noBackstockError) {
      const insertOrderRow: InsertOrderHistoryRow = {
        added_by: userId,
        data: JSON.parse(JSON.stringify(orderReportInfo))
      };
      
      insertOrderHistoryMutation.mutate(insertOrderRow, {
        onSuccess: () => {
          notifications.show({
            withCloseButton: true,
            color: "green",
            title: "Order Saved!",
            message: "The order data has been saved",
          });
          processingCompleteRef.current = true;
        },
        onError: (error) => {
          console.warn("Error saving order: ", error.message);
          notifications.show({
            withCloseButton: true,
            color: "red",
            title: "Saving Order Failed",
            message: error.message,
          });
        }
      });
    }
  };

  return (
    <Stack mt={"md"}>
      <Group grow>
        <Button onClick={handleBackClick}>
          Back to Edit
        </Button>
        <Button
          component={"a"}
          href={reportUrl}
          download={`order-${new Date().toLocaleDateString()}`}
          onClick={handleSaveDownloadClick}
        >
          Save and Download
        </Button>
      </Group>

      <Box h={{ sm: 800, base: 700 }}>
        <iframe
          src={`${reportUrl}#toolbar=0`}
          title="Order Report PDF"
          width="100%"
          height="100%"
          style={{ border: "1px solid #ccc" }}
        />
      </Box>
    </Stack>
  );
}

// import { supabase } from "@/integrations/supabase/client";
// import { useMarkBackstockUnavailableMutation } from "@/integrations/tanstack-query/mutations/markBackstockUnavailable";
// import { queryClient } from "@/integrations/tanstack-query/root-provider";
// import { Box, Button, Group, Stack } from "@mantine/core";
// import { notifications } from "@mantine/notifications";

// interface OrderDisplayProps {
//   usedBackstockIds: Set<number>;
//   setUsedBackstockIds: React.Dispatch<React.SetStateAction<Set<number>>>;
//   reportUrl: string;
//   setReportUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
//   jumpToStep: (step: number) => void;
//   processingCompleteRef: React.RefObject<boolean>;
// }

// export default function ReportDisplay({
//   usedBackstockIds,
//   setUsedBackstockIds,
//   reportUrl,
//   setReportUrl,
//   jumpToStep,
//   processingCompleteRef
// }: OrderDisplayProps) {
//   const markBackstockMutation = useMarkBackstockUnavailableMutation();

//   const handleBackClick = () => {
//     setUsedBackstockIds(new Set());
//     setReportUrl(undefined);
//     jumpToStep(1);
//   };

//   const handleSaveDownloadClick = () => {
//     markBackstockMutation.mutate(usedBackstockIds, {
//       onSuccess: () => {
//         notifications.show({
//           withCloseButton: true,
//           color: "green",
//           title: "Changes saved!",
//           message: "The backstock has been updated",
//         });
//         processingCompleteRef.current = true;
//       },
//       onError: (error) => {
//         console.warn("Error saving changes: ", error.message);
//         notifications.show({
//           withCloseButton: true,
//           color: "red",
//           title: "Changes not saved",
//           message: error.message,
//         });
//       },
//     });
//   };

//   return (
//     <Stack mt={"md"}>
//       <Group grow>
//         <Button onClick={handleBackClick}>
//           Back to Edit
//         </Button>
//         <Button
//           component={"a"}
//           href={reportUrl}
//           download={`order-${new Date().toLocaleDateString()}`}
//           onClick={handleSaveDownloadClick}
//         >
//           Save and Download
//         </Button>
//       </Group>

//       <Button onClick={resetBackstock}>Reset Backstock</Button>

//       <Box h={{ sm: 800, base: 700 }}>
//         <iframe
//           src={`${reportUrl}#toolbar=0`}
//           title="Order Report PDF"
//           width="100%"
//           height="100%"
//           style={{ border: "1px solid #ccc" }}
//         />
//       </Box>
//     </Stack>
//   );
// }

// async function resetBackstock() {
//   const { data, error } = await supabase
//     .from("backstock_proteins")
//     .update({ available: true, deleted_on: null })
//     .gt('id', 0);

//   queryClient.invalidateQueries({ queryKey: ["backstock"] }),

//   console.log(data);
//   console.log(error);
  
//   console.log("done");
// }
