import { Box, Button, Container, Group, Stack, Title } from "@mantine/core";
import { Dropzone, MIME_TYPES, type FileWithPath } from "@mantine/dropzone";
import { createFileRoute } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { IconFileDescription, IconUpload, IconX } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import Subtitle from "@/routes/-components/Subtitle";
import uploadOrder from "@/api/uploadOrder";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/orders")({
  component: Orders,
});

function Orders() {
  const atSmallBp = useMediaQuery("(min-width: 48em)");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileDrop = async (files: FileWithPath[]) => {
    const pdfBlob = await uploadOrder(files[0]);
    setPdfUrl(URL.createObjectURL(pdfBlob));
  };

  return (
    <Stack>
      <Title>Upload Order</Title>

      <Dropzone
        onDrop={handleFileDrop}
        onReject={() =>
          notifications.show({
            withCloseButton: true,
            color: "red",
            title: "Upload Failed",
            message: "Please upload a csv",
          })
        }
        accept={[MIME_TYPES.csv]}
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

      {pdfUrl && (
        <>
          <Group justify="center">
            <Button
              component={"a"}
              href={pdfUrl}
              download={`order-${new Date().toLocaleDateString()}`}
              w={150}
            >
              Download
            </Button>
            <Button w={150} onClick={() => setPdfUrl(null)}>
              Clear
            </Button>
          </Group>

          <Box h={{ sm: 800, base: 700 }}>
            <iframe
              src={pdfUrl}
              title="Order Report PDF"
              width="100%"
              height="100%"
              allowFullScreen
              style={{ border: "1px solid #ccc" }}
            />
          </Box>
        </>
      )}
    </Stack>
  );
}
