import {
  Button,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Order } from "../route";

interface HeaderInfo {
  orderKey: string;
  label: string;
  miw?: number;
}

const headersInfo: HeaderInfo[] = [
  { orderKey: 'fullName', label: "Full Name" },
  { orderKey: 'itemName', label: "Item Name", miw: 240 },
  { orderKey: 'quantity', label: "Quantity" },
  { orderKey: "proteinLabel", label: "Protein", miw: 150 },
  { orderKey: "flavorLabel", label: "Flavor", miw: 200 }
];

interface OrderEditorProps {
  orderData: Order[];
  setOrderData: React.Dispatch<React.SetStateAction<Order[] | null>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function OrderEditor({
  orderData,
  setOrderData,
  setActiveStep,
}: OrderEditorProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      orderRows: orderData,
    },
  });

  const headers = headersInfo.map((info) => (
    <Table.Th
      key={info.orderKey}
      style={{ whiteSpace: "nowrap" }}
      ta={'center'}
      miw={info.miw}
    >
      {info.label}
    </Table.Th>
  ));

  const rows = form.getValues().orderRows.map((_, rIndex) => (
    <Table.Tr key={rIndex}>
      <Table.Td ta={"center"}>
        {rIndex + 1}
      </Table.Td>
      {headersInfo.map((info) => {
        const orderKey = info.orderKey as keyof Order;
        const keyStr = `orderRows.${rIndex}.${orderKey}`;
        const isDirty = form.isDirty(keyStr);

        const tdInput = (() => {
          switch (orderKey) {
            case "itemName": {
              return (
                <Textarea
                  rows={1}
                  placeholder={info.label}
                  required={!!orderData[rIndex][orderKey]}
                  resize="both"
                  key={form.key(keyStr)}
                  {...form.getInputProps(keyStr)}
                />
              );
            }

            case "quantity": {
              return (
                <NumberInput
                  placeholder={info.label}
                  required={!!orderData[rIndex][orderKey]}
                  allowDecimal={false}
                  key={form.key(keyStr)}
                  {...form.getInputProps(keyStr)}
                />
              );
            }

            default: {
              return (
                <TextInput
                  placeholder={info.label}
                  required={!!orderData[rIndex][orderKey]}
                  key={form.key(keyStr)}
                  {...form.getInputProps(keyStr)}
                />
              );
            }
          }
        })();

        return (
          <Table.Td key={keyStr} bg={isDirty ? "blue" : undefined}>
            {tdInput}
          </Table.Td>
        );
      })}
    </Table.Tr>
  ));

  // const rows = form.getValues().orderRows.map((_, rIndex) => (
  //   <Table.Tr key={`row-${rIndex}`}>
  //     <Table.Td ta={"center"}>{rIndex + 1}</Table.Td>
  //     {orderData.displayHeaders.map((header) => {
  //       const keyStr = `orderRows.${rIndex}.${header}`;
  //       const isDirty = form.isDirty(keyStr);

  //       const tdInput = (() => {
  //         switch (header) {
  //           case "Item Name": {
  //             return (
  //               <Textarea
  //                 rows={1}
  //                 placeholder={header}
  //                 required={!!orderData.displayRows[rIndex][header]}
  //                 resize="both"
  //                 key={form.key(keyStr)}
  //                 {...form.getInputProps(keyStr)}
  //               />
  //             );
  //           }

  //           case "Quantity": {
  //             return (
  //               <NumberInput
  //                 placeholder={header}
  //                 required={!!orderData.displayRows[rIndex][header]}
  //                 allowDecimal={false}
  //                 key={form.key(keyStr)}
  //                 {...form.getInputProps(keyStr)}
  //               />
  //             );
  //           }

  //           default: {
  //             return (
  //               <TextInput
  //                 placeholder={header}
  //                 required={!!orderData.displayRows[rIndex][header]}
  //                 key={form.key(keyStr)}
  //                 {...form.getInputProps(keyStr)}
  //               />
  //             );
  //           }
  //         }
  //       })();

  //       return (
  //         <Table.Td key={keyStr} bg={isDirty ? "blue" : undefined}>
  //           {tdInput}
  //         </Table.Td>
  //       );
  //     })}
  //   </Table.Tr>
  // ));

  const handleSubmit = async () => {
    

    setActiveStep(2);
  };

  const handleBackClick = () => {
    setOrderData(null);
    setActiveStep(0);
  };

  const isDirty = form.isDirty();

  return (
    <Stack mt={'md'}>
      <Group grow>
        <Button onClick={handleBackClick} variant="default">
          Back to Upload
        </Button>
        <Tooltip disabled={isDirty} label="No changes detected">
          <Button disabled={!isDirty} onClick={form.reset} variant="default">
            Reset Form
          </Button>
        </Tooltip>
        <Button variant={"default"} onClick={handleSubmit}>
          {isDirty ? "Submit Changes" : "Submit without Changes"}
        </Button>
      </Group>

      <ScrollArea h={600} overscrollBehavior="contain">
        <Table
          stickyHeader
          highlightOnHover
          horizontalSpacing={"sm"}
          verticalSpacing={"sm"}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                style={{ whiteSpace: "nowrap" }}
                ta={'center'}
              >
                Row
              </Table.Th>
              {headers}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
