import { useState } from "react";

import Papa from "papaparse";

import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import Subtitle from "@/routes/-components/Subtitle";
import { notifications } from "@mantine/notifications";
import { Box, Container, Group, Stack, Text, Title } from "@mantine/core";
import { Dropzone, MIME_TYPES, type FileWithPath } from "@mantine/dropzone";
import { IconFileDescription, IconUpload, IconX } from "@tabler/icons-react";
import { flavorsOptions } from "@/integrations/tanstack-query/queries/flavors";
import { orderHeadersOptions } from "@/integrations/tanstack-query/queries/orderHeaders";

import { type Order } from "../route";

interface OrderUploadProps {
  setOrderData: React.Dispatch<React.SetStateAction<Order[] | null>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function OrderUpload({
  setOrderData,
  setActiveStep,
}: OrderUploadProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const atSmallBp = useMediaQuery("(min-width: 48em)");

  const { data: orderHeaderData, error: orderHeaderError } = useQuery(
    orderHeadersOptions()
  );
  const { data: flavorData, error: flavorError } = useQuery(flavorsOptions());

  const headerMapping: Record<string, string> = {};
  (orderHeaderData ?? []).forEach(
    (row) => (headerMapping[row.rawLabel] = row.label)
  );

  const flavorMapping: Record<string, string> = {};
  (flavorData ?? []).forEach(
    (row) => (flavorMapping[row.rawLabel] = row.label)
  );

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
            results.data as Record<string, string>[]
          );

          if (cleaningErrors.length > 0) {
            setParseError(
              cleaningErrors.map((err) => JSON.stringify(err)).join("\n")
            );
            return;
          }

          setOrderData(orderData);
          setActiveStep(1);
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

    function cleanParsedData(rows: Record<string, string>[]): {
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
      const requiredHeaders = Object.values(headerMapping);
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
        const rawFlavor = row[headerMapping.flavor];
        const flavorLabel = (() => {
          if (rawFlavor === "" || rawFlavor === "100% PLAIN-PLAIN") {
            return "COMPETITOR-PREP (100% PLAIN-PLAIN)";
          }
          if (rawFlavor === "SPICY BISON") {
            return "SPICY BEEF BISON";
          }
          return rawFlavor;
        })();

        const proteinLabel = row[headerMapping.protein];
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

        const fullName =
          row[headerMapping.firstName] + " " + row[headerMapping.lastName];
        orderData.push({
          fullName,
          itemName: row[headerMapping.itemName],
          flavor: flavorMapping[flavorLabel],
          flavorLabel,
          protein,
          proteinLabel,
          quantity: parseInt(row[headerMapping.quantity]),
        });
      });

      return { orderData, cleaningErrors };
    }
  };

  const handleReject = () => {
    notifications.show({
      withCloseButton: true,
      color: "red",
      title: "Upload Failed",
      message: "Please upload a csv",
    });
  };

  if (orderHeaderError || flavorError) {
    return (
      <Stack mt={"md"}>
        {orderHeaderError && (
          <>
            <Text>Issue fetching order headers</Text>
            <Text>{orderHeaderError.message}</Text>
          </>
        )}

        {flavorError && (
          <>
            <Text>Issue fetching flavors</Text>
            <Text>{flavorError.message}</Text>
          </>
        )}
      </Stack>
    );
  }

  console.log(headerMapping);
  console.log(flavorMapping);

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
