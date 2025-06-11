import FormWithDisable from "@/routes/-components/FormWithDisable";
import {
  Badge,
  CloseButton,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Table,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import type { SelectedBackstockRow } from "../route";
import { useUpdateBackstockMutation, type UpdateBackstockInfo } from "@/integrations/tanstack-query/mutations/updateBackstock";

interface EditSelectedModalProps {
  opened: boolean;
  handleClose: () => void;
  selected: SelectedBackstockRow[];
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  setUndoData: React.Dispatch<React.SetStateAction<UpdateBackstockInfo | null>>;
}

export default function EditSelectedModal({
  opened,
  handleClose,
  selected,
  setSelectedIds,
  setUndoData,
}: EditSelectedModalProps) {
  const updateBackstockMutation = useUpdateBackstockMutation();
  const form = useForm<{ selectedRows: SelectedBackstockRow[] }>({
    mode: "uncontrolled",
    initialValues: {
      selectedRows: selected.sort((rowA, rowB) =>
        rowA.name.localeCompare(rowB.name)
      ),
    },
  });

  const formRows = form.getValues().selectedRows.map((item, index) => (
    <Table.Tr key={item.id}>
      <Table.Th>
        <Badge color={item.displayColor} autoContrast>
          {item.protein}
        </Badge>
      </Table.Th>
      <Table.Td>
        <NumberInput
          placeholder="Weight (oz)"
          required
          suffix=" oz"
          hideControls
          allowDecimal={false}
          disabled={item.action === "delete"}
          key={form.key(`selectedRows.${index}.weight`)}
          {...form.getInputProps(`selectedRows.${index}.weight`)}
        />
      </Table.Td>
      <Table.Td>
        <DateInput
          placeholder="Date Added"
          required
          clearable
          disabled={item.action === "delete"}
          key={form.key(`selectedRows.${index}.createdAt`)}
          {...form.getInputProps(`selectedRows.${index}.createdAt`)}
        />
      </Table.Td>
      <Table.Td>
        <SegmentedControl
          data={[
            {
              value: "edit",
              label: <IconEdit />,
            },
            {
              value: "delete",
              label: (
                <IconTrash
                  color={item.action === "delete" ? "red" : undefined}
                />
              ),
            },
          ]}
          key={form.key(`selectedRows.${index}.action`)}
          {...form.getInputProps(`selectedRows.${index}.action`)}
        />
      </Table.Td>
    </Table.Tr>
  ));

  const handleSubmit = async (values: {
    selectedRows: SelectedBackstockRow[];
  }) => {
    console.log(values.selectedRows);

    const backstockInfo = values.selectedRows.reduce((acc, curr) => {
      const idStr = curr.id.toString();

      acc[idStr] = {
        weight: curr.weight,
        created_at:
          curr.createdAt instanceof Date
            ? curr.createdAt.toISOString()
            : new Date(curr.createdAt).toISOString(),
      };

      if (curr.action === "delete") {
        acc[idStr].deleted_on = new Date().toISOString();
      }

      return acc;
    }, {} as UpdateBackstockInfo);

    updateBackstockMutation.mutate(backstockInfo, {
      onSuccess: (data) => {
        const undoData = data.reduce((acc, curr) => {
          const idStr = curr.id.toString();

          acc[idStr] = {
            weight: curr.weight,
            created_at: curr.created_at,
            deleted_on: curr.deleted_on,
          };

          return acc;
        }, {} as UpdateBackstockInfo);

        setUndoData(undoData);

        notifications.show({
          withCloseButton: true,
          color: "green",
          title: "Backstock Edited",
          message: "The backstock rows have been altered and/or deleted",
        });
      },
      onError: (error) => {
        console.warn("Error updating backstock: ", error.message);
        notifications.show({
          withCloseButton: true,
          color: "red",
          title: "Updating backstock failed",
          message: error.message,
        });
      },
      onSettled: () => {
        setSelectedIds(new Set<number>());
        handleClose();
      }
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      size={"auto"}
      padding={0}
    >
      <Group mb={"md"}>
        <Title me={"auto"}>Update Backstock</Title>
        <CloseButton size={"xl"} onClick={handleClose} />
      </Group>
      <FormWithDisable
        submitButtonLabels={{
          label: "Update",
          disabledLabel: "Updating...",
        }}
        submitButtonStyle={{ mt: "md" }}
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              <Table.Th ta={"center"}>Weight</Table.Th>
              <Table.Th ta={"center"}>Date Added</Table.Th>
              <Table.Th ta={"center"}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{formRows}</Table.Tbody>
        </Table>
      </FormWithDisable>
    </Modal>
  );
}


// import FormWithDisable from "@/routes/-components/FormWithDisable";
// import {
//   Badge,
//   CloseButton,
//   Group,
//   Modal,
//   NumberInput,
//   SegmentedControl,
//   Table,
//   Title,
// } from "@mantine/core";
// import { useForm } from "@mantine/form";
// import { IconEdit, IconTrash } from "@tabler/icons-react";
// import { DateInput } from "@mantine/dates";
// import {
//   updateBackstock,
//   type UpdateBackstockInfo,
// } from "@/integrations/supabase/database/updateBackstock";
// import { useQueryClient } from "@tanstack/react-query";
// import { notifications } from "@mantine/notifications";
// import type { SelectedBackstockRow } from "../route";

// interface EditSelectedModalProps {
//   opened: boolean;
//   handleClose: () => void;
//   selected: SelectedBackstockRow[];
//   setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
//   setUndoData: React.Dispatch<React.SetStateAction<UpdateBackstockInfo | null>>;
// }

// export default function EditSelectedModal({
//   opened,
//   handleClose,
//   selected,
//   setSelectedIds,
//   setUndoData,
// }: EditSelectedModalProps) {
//   const queryClient = useQueryClient();
//   const form = useForm<{ selectedRows: SelectedBackstockRow[] }>({
//     mode: "uncontrolled",
//     initialValues: {
//       selectedRows: selected.sort((rowA, rowB) =>
//         rowA.name.localeCompare(rowB.name)
//       ),
//     },
//   });

//   const formRows = form.getValues().selectedRows.map((item, index) => (
//     <Table.Tr key={item.id}>
//       <Table.Th>
//         <Badge color={item.displayColor} autoContrast>
//           {item.protein}
//         </Badge>
//       </Table.Th>
//       <Table.Td>
//         <NumberInput
//           placeholder="Weight (oz)"
//           required
//           suffix=" oz"
//           hideControls
//           allowDecimal={false}
//           disabled={item.action === "delete"}
//           key={form.key(`selectedRows.${index}.weight`)}
//           {...form.getInputProps(`selectedRows.${index}.weight`)}
//         />
//       </Table.Td>
//       <Table.Td>
//         <DateInput
//           placeholder="Date Added"
//           required
//           clearable
//           disabled={item.action === "delete"}
//           key={form.key(`selectedRows.${index}.createdAt`)}
//           {...form.getInputProps(`selectedRows.${index}.createdAt`)}
//         />
//       </Table.Td>
//       <Table.Td>
//         <SegmentedControl
//           data={[
//             {
//               value: "edit",
//               label: <IconEdit />,
//             },
//             {
//               value: "delete",
//               label: (
//                 <IconTrash
//                   color={item.action === "delete" ? "red" : undefined}
//                 />
//               ),
//             },
//           ]}
//           key={form.key(`selectedRows.${index}.action`)}
//           {...form.getInputProps(`selectedRows.${index}.action`)}
//         />
//       </Table.Td>
//     </Table.Tr>
//   ));

//   const handleSubmit = async (values: {
//     selectedRows: SelectedBackstockRow[];
//   }) => {
//     console.log(values.selectedRows);

//     const backstockInfo = values.selectedRows.reduce((acc, curr) => {
//       const idStr = curr.id.toString();

//       acc[idStr] = {
//         weight: curr.weight,
//         created_at:
//           curr.createdAt instanceof Date
//             ? curr.createdAt.toISOString()
//             : new Date(curr.createdAt).toISOString(),
//       };

//       if (curr.action === "delete") {
//         acc[idStr].deleted_on = new Date().toISOString();
//       }

//       return acc;
//     }, {} as UpdateBackstockInfo);

//     try {
//       const undoRows = await updateBackstock(backstockInfo);
//       console.log(undoRows);

//       const undoData = undoRows.reduce((acc, curr) => {
//         const idStr = curr.id.toString();

//         acc[idStr] = {
//           weight: curr.weight,
//           created_at: curr.created_at,
//           deleted_on: curr.deleted_on,
//         };

//         return acc;
//       }, {} as UpdateBackstockInfo);

//       setUndoData(undoData);
//       queryClient.invalidateQueries({ queryKey: ["backstock"] });

//       notifications.show({
//         withCloseButton: true,
//         color: "green",
//         title: "Backstock Edited",
//         message: "The backstock rows have been altered and/or deleted",
//       });
//     } catch (error) {
//       if (error instanceof Error) {
//         console.warn("Error updating backstock: ", error.message);
//       } else {
//         console.warn(
//           "Unkown error updating backstock: ",
//           JSON.stringify(error)
//         );
//       }

//       notifications.show({
//         withCloseButton: true,
//         color: "red",
//         title: "Updating backstock failed",
//         message: `${(error as Error)?.message || JSON.stringify(error)}`,
//       });
//     } finally {
//       setSelectedIds(new Set());
//       handleClose();
//     }
//   };

//   return (
//     <Modal
//       opened={opened}
//       onClose={handleClose}
//       withCloseButton={false}
//       size={"auto"}
//       padding={0}
//     >
//       <Group mb={"md"}>
//         <Title me={"auto"}>Update Backstock</Title>
//         <CloseButton size={"xl"} onClick={handleClose} />
//       </Group>
//       <FormWithDisable
//         submitButtonLabels={{
//           label: "Update",
//           disabledLabel: "Updating...",
//         }}
//         submitButtonStyle={{ mt: "md" }}
//         onSubmit={form.onSubmit(handleSubmit)}
//       >
//         <Table>
//           <Table.Thead>
//             <Table.Tr>
//               <Table.Th></Table.Th>
//               <Table.Th ta={"center"}>Weight</Table.Th>
//               <Table.Th ta={"center"}>Date Added</Table.Th>
//               <Table.Th ta={"center"}>Action</Table.Th>
//             </Table.Tr>
//           </Table.Thead>
//           <Table.Tbody>{formRows}</Table.Tbody>
//         </Table>
//       </FormWithDisable>
//     </Modal>
//   );
// }
