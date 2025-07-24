import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useDisclosure, useToggle } from "@mantine/hooks";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { backstockOptions } from "@/integrations/tanstack-query/queries/backstock";
import { useUpdateBackstockMutation } from "@/integrations/tanstack-query/mutations/updateBackstock";
import type {
  SelectedBackstockRow,
  UpdateBackstockInfo,
} from "@rpmp-portal/types";
import NavigationBlockAlert from "@/components/misc/NavigationBlockAlert";
import AddNewModal from "@/components/dashboard/backstock/AddNewModal";
import EditSelectedModal from "@/components/dashboard/backstock/EditSelectedModal";
import BackstockTable from "@/components/dashboard/backstock/BackstockTable";
import LoadingScreen from "@/components/misc/LoadingScreen";

export const Route = createFileRoute("/_authCheck/dashboard/backstock")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(backstockOptions());
  },
  pendingComponent: LoadingScreen,
  component: Backstock,
});

function Backstock() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [undoData, setUndoData] = useState<UpdateBackstockInfo | null>(null);
  const [isUndoing, toggleIsUndoing] = useToggle();
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [removeOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => !!undoData,
    withResolver: true,
  });

  const { data: allBackstock, error } = useSuspenseQuery({
    ...backstockOptions(),
    select: (data) => data.filter((row) => row.isProtein === true),
  });
  const updateBackstockMutation = useUpdateBackstockMutation();

  const selected: SelectedBackstockRow[] = useMemo(() => {
    return allBackstock
      .filter((row) => selectedIds.has(row.id))
      .map((row) => ({
        ...row,
        name: `${row.nameLabel}: ${row.subNameLabel}`,
        action: row.available ? "edit" : "delete",
      }));
  }, [allBackstock, selectedIds]);

  const selectAllClaimed = () => {
    if (!allBackstock) return;

    setSelectedIds(() => {
      const claimed = new Set<number>();
      return allBackstock.reduce((claimed, row) => {
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
      <NavigationBlockAlert
        opened={status === "blocked"}
        proceed={proceed}
        reset={reset}
        text={{
          // To do: make these more specific
          title: "Wait stop!",
          message: "If you leave now all will be lost!",
        }}
      />

      <AddNewModal opened={addOpened} handleClose={closeAdd} />

      {/* This modal should only be conditionally rendered so that the form inside is reinitialized with any changes to the selected variable */}
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

      {!error ? (
        <BackstockTable
          backstockRows={allBackstock}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      ) : (
        <Paper>
          <Text>Error fetching backstock:</Text>
          <Text>{error.message}</Text>
        </Paper>
      )}
    </Stack>
  );
}
