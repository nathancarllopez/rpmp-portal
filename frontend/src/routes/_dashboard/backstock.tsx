import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createFileRoute } from "@tanstack/react-router";
import { useDisclosure, useToggle } from "@mantine/hooks";
import {
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  backstockOptions,
  type BackstockRow,
} from "@/integrations/tanstack-query/queries/backstock";
import {
  type UpdateBackstockInfo,
  useUpdateBackstockMutation,
} from "@/integrations/tanstack-query/mutations/updateBackstock";
import AddNewModal from "./-components/backstock/AddNewModal";
import EditSelectedModal from "./-components/backstock/EditSelectedModal";
import BackstockTable from "./-components/backstock/BackstockTable";

export const Route = createFileRoute('/_dashboard/backstock')({
  component: BackstockRoute,
})

type FieldAction = "edit" | "delete";

export interface SelectedBackstockRow extends BackstockRow {
  name: string;
  action: FieldAction;
}

// To do: Add navigation blocking when undo data is not null, advising user that leaving this page will make it impossible to undo their last edit.
// Put this in a modal, and add a checkbox that will turn off this warning. If checked, let user know that the warnings can be toggled in the settings page

function BackstockRoute() {
  const { data, error } = useQuery(backstockOptions());
  const updateBackstockMutation = useUpdateBackstockMutation();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [undoData, setUndoData] = useState<UpdateBackstockInfo | null>(null);
  const [isUndoing, toggleIsUndoing] = useToggle();
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [removeOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const selected: SelectedBackstockRow[] = useMemo(() => {
    return (data ?? [])
      .filter((row) => selectedIds.has(row.id))
      .map((row) => ({
        ...row,
        name: `${row.protein}: ${row.flavor}`,
        action: row.available ? "edit" : "delete",
      }));
  }, [data, selectedIds]);

  const selectAllClaimed = () => {
    if (!data) return;

    setSelectedIds(() => {
      const claimed = new Set<number>();
      return data.reduce((claimed, row) => {
        if (!row.available) {
          claimed.add(row.id);
        }
        return claimed;
      }, claimed);
    });
  };

  const handleUndoClick = async () => {
    if (!undoData) {
      throw new Error("Tried to undo with no undo data");
    }

    toggleIsUndoing();

    updateBackstockMutation.mutate(undoData, {
      onSuccess: () => {
        setUndoData(null);
        toggleIsUndoing();

        notifications.show({
          withCloseButton: true,
          color: "green",
          title: "Undo Successful",
          message: "Your edits have been reversed",
        });
      },
      onError: (error) => {
        console.warn("Error undoiong backstock edit: ", error.message);
        notifications.show({
          withCloseButton: true,
          color: "red",
          title: "Undoing backstock edit failed",
          message: error.message,
        });
      },
      onSettled: () => toggleIsUndoing(),
    });
  };

  const buttonWidth = 160;

  return (
    <Stack>
      {addOpened && <AddNewModal opened={addOpened} handleClose={closeAdd} />}
      {removeOpened && (
        <EditSelectedModal
          opened={removeOpened}
          handleClose={closeEdit}
          selected={selected}
          setSelectedIds={setSelectedIds}
          setUndoData={setUndoData}
        />
      )}

      <Group>
        <Title me={"auto"}>Backstock</Title>
        <Button w={buttonWidth} onClick={openAdd}>
          Add Backstock
        </Button>
        <Button w={buttonWidth} onClick={selectAllClaimed}>
          Select All Claimed
        </Button>
        <Tooltip
          disabled={selectedIds.size !== 0}
          label="Select rows you want to edit"
        >
          <Button
            w={buttonWidth}
            disabled={selectedIds.size === 0}
            onClick={openEdit}
          >
            Edit Backstock
          </Button>
        </Tooltip>
      </Group>

      {undoData && (
        <Button
          variant="outline"
          color="red"
          fullWidth
          onClick={handleUndoClick}
          disabled={isUndoing}
        >
          {isUndoing ? "Undoing..." : "Undo Last Edit"}
        </Button>
      )}

      {error && <Text>{error.message}</Text>}

      {!error &&
        (data ? (
          <BackstockTable
            data={data}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        ) : (
          <Center mt={100}>
            <Loader />
          </Center>
        ))}
    </Stack>
  );
}