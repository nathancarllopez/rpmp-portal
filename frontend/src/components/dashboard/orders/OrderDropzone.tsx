import { useState } from "react";
import Papa from "papaparse";
import { useMediaQuery } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { Box, Container, Group, Stack, Text, Title } from "@mantine/core";
import { Dropzone, MIME_TYPES, type FileWithPath } from "@mantine/dropzone";
import { IconFileDescription, IconUpload, IconX } from "@tabler/icons-react";
import { flavorsOptions } from "@/integrations/tanstack-query/queries/flavors";
import { orderHeadersOptions } from "@/integrations/tanstack-query/queries/orderHeaders";
import type { ContainerSize, Order, OrderReportInfo } from "@rpmp-portal/types";
import Subtitle from "../../misc/Subtitle";

export interface OrderDropzoneProps {
  setOrderReportInfo: React.Dispatch<React.SetStateAction<OrderReportInfo>>;
  toNextStep: () => void;
}

export function OrderDropzone({
  setOrderReportInfo,
  toNextStep,
}: OrderDropzoneProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const atSmallBp = useMediaQuery("(min-width: 48em)");

  const { data: headerMapping, error: headerError } = useSuspenseQuery({
    ...orderHeadersOptions(),
    select: (data) =>
      data.reduce((mapping, headerRow) => {
        if (headerRow.rawLabel) {
          // Some of the headers are only used to display, not parse the raw data
          mapping[headerRow.name] = {
            label: headerRow.label,
            rawLabel: headerRow.rawLabel,
          };
        }
        return mapping;
      }, {} as { [name: string]: { label: string; rawLabel: string } }),
  });

  const { data: flavorMapping, error: flavorError } = useSuspenseQuery({
    ...flavorsOptions(),
    select: (data) =>
      data.reduce((mapping, flavorRow) => {
        mapping[flavorRow.rawLabel] = {
          flavor: flavorRow.name,
          flavorLabel: flavorRow.label,
        };
        return mapping;
      }, {} as { [rawLabel: string]: { flavor: string; flavorLabel: string } }),
  });

  const errors = [headerError, flavorError].filter((err) => !!err);
  if (errors.length > 0) {
    return (
      <Stack mt={"md"}>
        {errors.map((err, index) => (
          <Text key={index}>{err.message}</Text>
        ))}
      </Stack>
    );
  }

  const handleDrop = async (files: FileWithPath[]) => {
    setIsParsing(true);

    Papa.parse(files[0], {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => {
        const parseErrors = results.errors;

        if (parseErrors.length > 0) {
          setParseError(
            parseErrors.map((err) => JSON.stringify(err)).join("\n")
          );
          setIsParsing(false);
          return;
        }

        try {
          const { orderData, cleaningErrors } = cleanParsedData(
            results.data as Record<string, string>[],
            headerMapping,
            flavorMapping
          );

          if (cleaningErrors.length > 0) {
            setParseError(
              cleaningErrors.map((err) => JSON.stringify(err)).join("\n")
            );
            return;
          }

          setOrderReportInfo((curr) => ({ ...curr, orderData }));
          toNextStep();
        } catch (error) {
          console.warn("Error occurred while parsing order upload:");

          if (error instanceof Error) {
            console.warn(error.message);
          } else {
            console.warn(JSON.stringify(error));
          }
        } finally {
          setIsParsing(false);
        }
      },
    });
  };

  const handleReject = () => {
    notifications.show({
      withCloseButton: true,
      color: "red",
      title: "Upload Failed",
      message: "Please upload a csv",
    });
  };

  return (
    <Stack mt={"md"}>
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        accept={[MIME_TYPES.csv]}
        loading={isParsing}
        disabled={!!parseError}
      >
        <Group justify="center" mih={100} style={{ pointerEvents: "none" }}>
          <Dropzone.Idle>
            <IconFileDescription size={50} />
          </Dropzone.Idle>
          <Dropzone.Accept>
            <IconUpload size={50} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={50} />
          </Dropzone.Reject>

          <Container mx={0}>
            <Title order={atSmallBp ? 3 : 4} ta={"center"}>
              {atSmallBp
                ? "Drag and drop the order sheet here"
                : "Tap here to upload the order sheet"}
            </Title>
            <Box visibleFrom="sm">
              <Subtitle>
                You can also click to search for the order sheet
              </Subtitle>
            </Box>
          </Container>
        </Group>
      </Dropzone>

      {parseError && (
        <>
          <Text>Issue parsing order:</Text>
          <Text>{parseError}</Text>
        </>
      )}
    </Stack>
  );
}

function cleanParsedData(
  rows: Record<string, string>[],
  headerMapping: { [name: string]: { label: string; rawLabel: string } },
  flavorMapping: { [rawLabel: string]: { flavor: string; flavorLabel: string } }
): {
  orderData: Order[];
  cleaningErrors: Record<string, string>[];
} {
  const orderData: Order[] = [];
  const cleaningErrors: Record<string, string>[] = [];

  if (rows.length === 0) {
    cleaningErrors.push({
      noRowsPassed: "",
    });
    return { orderData, cleaningErrors };
  }

  const firstRow = rows[0];
  const requiredHeaders = Object.values(headerMapping).map(
    ({ rawLabel }) => rawLabel
  );

  for (const header of requiredHeaders) {
    if (!firstRow.hasOwnProperty(header)) {
      cleaningErrors.push({
        missingHeader: header,
      });
    }
  }

  if (cleaningErrors.length > 0) {
    return { orderData, cleaningErrors };
  }

  const filtered: Record<string, string>[] = rows.filter(() => true);
  filtered.forEach((row) => {
    const fullName =
      row[headerMapping.firstName.rawLabel] +
      " " +
      row[headerMapping.lastName.rawLabel];

    const itemName = row[headerMapping.itemName.rawLabel];
    const quantity = parseInt(row[headerMapping.quantity.rawLabel]);
    const { container, weight, issue } = getContainerAndWeight(
      itemName,
      quantity
    );

    if (container === null || weight === null) {
      cleaningErrors.push({
        containerOrWeight: issue || "",
      });
      return;
    }

    const rawFlavorText = row[headerMapping.flavor.rawLabel];
    const rawFlavorLabel = (() => {
      if (rawFlavorText === "" || rawFlavorText === "100% PLAIN-PLAIN") {
        return "COMPETITOR-PREP (100% PLAIN-PLAIN)";
      }
      if (rawFlavorText === "SPICY BISON") {
        return "SPICY BEEF BISON";
      }
      return rawFlavorText;
    })();
    const { flavor, flavorLabel } = flavorMapping[rawFlavorLabel];

    const proteinLabel = row[headerMapping.protein.rawLabel];
    const protein = (() => {
      switch (proteinLabel) {
        case "Beef Bison":
        case "Egg Whites":
        case "Mahi Mahi": {
          const [first, second] = proteinLabel.split(" ");
          return first.toLowerCase() + second;
        }

        default: {
          return proteinLabel.toLowerCase();
        }
      }
    })();

    orderData.push({
      fullName,
      itemName,
      container,
      weight,
      flavor,
      flavorLabel,
      protein,
      proteinLabel,
      quantity,
    });
  });

  return { orderData, cleaningErrors };
}

function getContainerAndWeight(
  itemName: string,
  quantity: number
): {
  container: ContainerSize | null;
  weight: number | null;
  issue: string | null;
} {
  // Captures, e.g., "2 lbs", "4.5oz", "3lb", and "17 oz"
  const pattern = /\b(\d+(\.\d+)?)\s?(lb|lbs|oz)\b/i;
  const matches = itemName.match(pattern);

  if (!matches) {
    console.log("Could not extract container size from item name");
    return {
      container: null,
      weight: null,
      issue: "Could not extract container size from item name",
    };
  }

  const match = matches[0].replace(" ", "").toLowerCase();
  if (match.includes("lb")) {
    const weightInOz =
      16 * parseFloat(match.replace("lbs", "").replace("lb", ""));
    return {
      container: "bulk",
      weight: weightInOz * quantity,
      issue: null,
    };
  } else if (["2.5oz", "4oz", "6oz", "8oz", "10oz"].includes(match)) {
    const weight = parseFloat(match.replace("oz", ""));
    return {
      container: match as ContainerSize,
      weight: weight * quantity,
      issue: null,
    };
  }

  console.log(`Unexpected container size: ${match}`);
  return {
    container: null,
    weight: null,
    issue: `Unexpected container size: ${match}`,
  };
}

// import { useState } from "react";

// import Papa from "papaparse";

// import { useMediaQuery } from "@mantine/hooks";
// import { useSuspenseQuery } from "@tanstack/react-query";
// import { notifications } from "@mantine/notifications";
// import { Box, Container, Group, Stack, Text, Title } from "@mantine/core";
// import { Dropzone, MIME_TYPES, type FileWithPath } from "@mantine/dropzone";
// import { IconFileDescription, IconUpload, IconX } from "@tabler/icons-react";
// import { flavorsOptions } from "@/integrations/tanstack-query/queries/flavors";
// import { orderHeadersOptions } from "@/integrations/tanstack-query/queries/orderHeaders";
// import type { ContainerSize, Order } from "@rpmp-portal/types";
// import Subtitle from "../../misc/Subtitle";

// export interface OrderDropzoneProps {
//   setOrderData: React.Dispatch<React.SetStateAction<Order[] | null>>;
//   setInitialOrderData: React.Dispatch<React.SetStateAction<Order[] | null>>;
//   toNextStep: () => void;
// }

// export function OrderDropzone({
//   setOrderData,
//   setInitialOrderData,
//   toNextStep,
// }: OrderDropzoneProps) {
//   const [isParsing, setIsParsing] = useState(false);
//   const [parseError, setParseError] = useState<string | null>(null);
//   const atSmallBp = useMediaQuery("(min-width: 48em)");

//   const { data: headerMapping, error: headerError } = useSuspenseQuery({
//     ...orderHeadersOptions(),
//     select: (data) => data.reduce((mapping, headerRow) => {
//       if (headerRow.rawLabel) { // Some of the headers are only used to display, not parse the raw data
//         mapping[headerRow.name] = { label: headerRow.label, rawLabel: headerRow.rawLabel };
//       }
//       return mapping;
//     }, {} as { [name: string]: { label: string, rawLabel: string } })
//   });

//   const { data: flavorMapping, error: flavorError } = useSuspenseQuery({
//     ...flavorsOptions(),
//     select: (data) => data.reduce((mapping, flavorRow) => {
//       mapping[flavorRow.rawLabel] = {
//         flavor: flavorRow.name,
//         flavorLabel: flavorRow.label
//       };
//       return mapping;
//     }, {} as { [rawLabel: string]: { flavor: string, flavorLabel: string } })
//   });

//   const errors = [headerError, flavorError].filter((err) => !!err);
//   if (errors.length > 0) {
//     return (
//       <Stack mt={"md"}>
//         {errors.map((err, index) => (
//           <Text key={index}>{err.message}</Text>
//         ))}
//       </Stack>
//     );
//   }

//   const handleDrop = async (files: FileWithPath[]) => {
//     setIsParsing(true);

//     Papa.parse(files[0], {
//       header: true,
//       skipEmptyLines: "greedy",
//       transformHeader: (header) => header.trim(),
//       transform: (value) => value.trim(),
//       complete: (results) => {
//         const parseErrors = results.errors;

//         if (parseErrors.length > 0) {
//           setParseError(
//             parseErrors.map((err) => JSON.stringify(err)).join("\n")
//           );
//           setIsParsing(false);
//           return;
//         }

//         try {
//           const { orderData, cleaningErrors } = cleanParsedData(
//             results.data as Record<string, string>[],
//             headerMapping,
//             flavorMapping
//           );

//           if (cleaningErrors.length > 0) {
//             setParseError(
//               cleaningErrors.map((err) => JSON.stringify(err)).join("\n")
//             );
//             return;
//           }

//           setOrderData(orderData);
//           setInitialOrderData(orderData);
//           toNextStep();
//         } catch (error) {
//           console.warn("Error occurred while parsing order upload:");

//           if (error instanceof Error) {
//             console.warn(error.message);
//           } else {
//             console.warn(JSON.stringify(error));
//           }
//         } finally {
//           setIsParsing(false);
//         }
//       },
//     });
//   };

//   const handleReject = () => {
//     notifications.show({
//       withCloseButton: true,
//       color: "red",
//       title: "Upload Failed",
//       message: "Please upload a csv",
//     });
//   };

//   return (
//     <Stack mt={"md"}>
//       <Dropzone
//         onDrop={handleDrop}
//         onReject={handleReject}
//         accept={[MIME_TYPES.csv]}
//         loading={isParsing}
//         disabled={!!parseError}
//       >
//         <Group justify="center" mih={100} style={{ pointerEvents: "none" }}>
//           <Dropzone.Idle>
//             <IconFileDescription size={50} />
//           </Dropzone.Idle>
//           <Dropzone.Accept>
//             <IconUpload size={50} />
//           </Dropzone.Accept>
//           <Dropzone.Reject>
//             <IconX size={50} />
//           </Dropzone.Reject>

//           <Container mx={0}>
//             <Title order={atSmallBp ? 3 : 4} ta={"center"}>
//               {atSmallBp
//                 ? "Drag and drop the order sheet here"
//                 : "Tap here to upload the order sheet"}
//             </Title>
//             <Box visibleFrom="sm">
//               <Subtitle>
//                 You can also click to search for the order sheet
//               </Subtitle>
//             </Box>
//           </Container>
//         </Group>
//       </Dropzone>

//       {parseError && (
//         <>
//           <Text>Issue parsing order:</Text>
//           <Text>{parseError}</Text>
//         </>
//       )}
//     </Stack>
//   );
// }

// function cleanParsedData(
//   rows: Record<string, string>[],
//   headerMapping: { [name: string]: { label: string, rawLabel: string } },
//   flavorMapping: { [rawLabel: string]: { flavor: string, flavorLabel: string } }
// ): {
//   orderData: Order[];
//   cleaningErrors: Record<string, string>[];
// } {
//   const orderData: Order[] = [];
//   const cleaningErrors: Record<string, string>[] = [];

//   if (rows.length === 0) {
//     cleaningErrors.push({
//       noRowsPassed: "",
//     });
//     return { orderData, cleaningErrors };
//   }

//   const firstRow = rows[0];
//   const requiredHeaders = Object.values(headerMapping).map(({ rawLabel }) => rawLabel);

//   for (const header of requiredHeaders) {
//     if (!firstRow.hasOwnProperty(header)) {
//       cleaningErrors.push({
//         missingHeader: header,
//       });
//     }
//   }

//   if (cleaningErrors.length > 0) {
//     return { orderData, cleaningErrors };
//   }

//   const filtered: Record<string, string>[] = rows.filter(() => true);
//   filtered.forEach((row) => {
//     const fullName =
//       row[headerMapping.firstName.rawLabel] + " " + row[headerMapping.lastName.rawLabel];

//     const itemName = row[headerMapping.itemName.rawLabel];
//     const quantity = parseInt(row[headerMapping.quantity.rawLabel]);
//     const { container, weight, issue } = getContainerAndWeight(
//       itemName,
//       quantity
//     );

//     if (container === null || weight === null) {
//       cleaningErrors.push({
//         containerOrWeight: issue || "",
//       });
//       return;
//     }

//     const rawFlavorText = row[headerMapping.flavor.rawLabel];
//     const rawFlavorLabel = (() => {
//       if (rawFlavorText === "" || rawFlavorText === "100% PLAIN-PLAIN") {
//         return "COMPETITOR-PREP (100% PLAIN-PLAIN)";
//       }
//       if (rawFlavorText === "SPICY BISON") {
//         return "SPICY BEEF BISON";
//       }
//       return rawFlavorText;
//     })();
//     const { flavor, flavorLabel } = flavorMapping[rawFlavorLabel];

//     const proteinLabel = row[headerMapping.protein.rawLabel];
//     const protein = (() => {
//       switch (proteinLabel) {
//         case "Beef Bison":
//         case "Egg Whites":
//         case "Mahi Mahi": {
//           const [first, second] = proteinLabel.split(" ");
//           return first.toLowerCase() + second;
//         }

//         default: {
//           return proteinLabel.toLowerCase();
//         }
//       }
//     })();

//     orderData.push({
//       fullName,
//       itemName,
//       container,
//       weight,
//       flavor,
//       flavorLabel,
//       protein,
//       proteinLabel,
//       quantity,
//     });
//   });

//   return { orderData, cleaningErrors };
// }

// function getContainerAndWeight(
//   itemName: string,
//   quantity: number
// ): {
//   container: ContainerSize | null;
//   weight: number | null;
//   issue: string | null;
// } {
//   // Captures, e.g., "2 lbs", "4.5oz", "3lb", and "17 oz"
//   const pattern = /\b(\d+(\.\d+)?)\s?(lb|lbs|oz)\b/i;
//   const matches = itemName.match(pattern);

//   if (!matches) {
//     console.log("Could not extract container size from item name");
//     return {
//       container: null,
//       weight: null,
//       issue: "Could not extract container size from item name",
//     };
//   }

//   const match = matches[0].replace(" ", "").toLowerCase();
//   if (match.includes("lb")) {
//     const weightInOz =
//       16 * parseFloat(match.replace("lbs", "").replace("lb", ""));
//     return {
//       container: "bulk",
//       weight: weightInOz * quantity,
//       issue: null,
//     };
//   } else if (["2.5oz", "4oz", "6oz", "8oz", "10oz"].includes(match)) {
//     const weight = parseFloat(match.replace("oz", ""));
//     return {
//       container: match as ContainerSize,
//       weight: weight * quantity,
//       issue: null,
//     };
//   }

//   console.log(`Unexpected container size: ${match}`);
//   return {
//     container: null,
//     weight: null,
//     issue: `Unexpected container size: ${match}`,
//   };
// }
