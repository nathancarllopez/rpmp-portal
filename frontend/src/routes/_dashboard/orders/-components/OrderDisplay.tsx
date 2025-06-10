import { Box, Button, Group, LoadingOverlay, Stack } from "@mantine/core";

interface OrderDisplayProps {
  orderReportUrl: string | undefined;
  setOrderReportUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function OrderDisplay({
  orderReportUrl,
  setOrderReportUrl,
  setActiveStep,
}: OrderDisplayProps) {
  const handleBackClick = () => {
    setOrderReportUrl(undefined);
    setActiveStep(1);
  };

  return (
    <Stack pos={"relative"} mt={"md"}>
      <LoadingOverlay visible={!orderReportUrl} />

      <Group grow>
        <Button variant="default" onClick={handleBackClick}>
          Back to Edit
        </Button>
        <Button
          variant="default"
          component={"a"}
          href={orderReportUrl}
          download={`order-${new Date().toLocaleDateString()}`}
        >
          Download
        </Button>
      </Group>

      <Box h={{ sm: 800, base: 700 }}>
        <iframe
          src={orderReportUrl}
          title="Order Report PDF"
          width="100%"
          height="100%"
          allowFullScreen
          style={{ border: "1px solid #ccc" }}
        />
      </Box>
    </Stack>
  );
}
