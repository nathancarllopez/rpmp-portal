import { useState } from "react";

import { useForm } from "@mantine/form";
import { useCounter } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconRestore, IconTrash } from "@tabler/icons-react";
import { proteinsAndFlavorsOptions } from "@/integrations/tanstack-query/queries/proteinsWithFlavors";
import { useInsertBackstockMutation } from "@/integrations/tanstack-query/mutations/insertBackstock";
import {
  ActionIcon,
  Button,
  CloseButton,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import FormWithDisable from "../../misc/FormWithDisable";
import { camelToSnake, type InsertBackstockRow } from "@rpmp-portal/types";

interface AddNewModalProps {
  opened: boolean;
  handleClose: () => void;
}

type FlavorSelectData = { value: string; label: string }[] | null;

export default function AddNewModal({ opened, handleClose }: AddNewModalProps) {
  const [count, { increment }] = useCounter(0);
  const [flavorSelectData, setFlavorSelectData] = useState<FlavorSelectData[]>([
    [],
  ]);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      newBackstock: [
        {
          key: count,
          protein: "",
          flavor: "",
          weight: "",
        },
      ],
    },
  });

  const insertBackstockMutation = useInsertBackstockMutation();
  const { data, error } = useSuspenseQuery(proteinsAndFlavorsOptions());
  const proteinsWithFlavors = data || [];
  const modalSize = 800;

  const handleResetFields = () => {
    form.reset();
    setFlavorSelectData([[]]);
  };

  const ModalHeader = () => (
    <Group>
      <Title>Add New Backstock</Title>
      <Button
        leftSection={<IconRestore />}
        size="xs"
        variant="default"
        onClick={handleResetFields}
      >
        Reset
      </Button>
      <CloseButton size={"lg"} ms="auto" onClick={handleClose} />
    </Group>
  );

  if (error || data.length === 0) {
    return (
      <Modal opened={opened} onClose={handleClose} size={modalSize}>
        <ModalHeader />
        <Paper>
          <Text>Error occurred while fetching protein/flavor data</Text>
          {error ? (
            <Text>{error.message}</Text>
          ) : (
            <Text>No proteins and flavors returned</Text>
          )}
        </Paper>
      </Modal>
    );
  }

  const handleAddField = () => {
    const newKey = count + 1;
    form.insertListItem("newBackstock", {
      key: newKey,
      protein: "",
      flavor: "",
      weight: "",
    });
    setFlavorSelectData((current) => {
      const copy = [...current];
      copy[newKey] = [];
      return copy;
    });
    increment();
  };
  const handleRemoveField = (formIndex: number, flavorKey: number) => {
    form.removeListItem("newBackstock", formIndex);
    setFlavorSelectData((current) => {
      const copy = [...current];
      delete copy[flavorKey];
      return copy;
    });
  };

  const formFields = form.getValues().newBackstock.map((item, index) => (
    <Group key={item.key} mb={"md"} justify="space-between">
      <Select
        placeholder="Protein"
        data={proteinsWithFlavors.map((row) => ({
          value: row.proteinName,
          label: row.proteinLabel,
        }))}
        searchable
        required
        key={form.key(`newBackstock.${index}.protein`)}
        {...form.getInputProps(`newBackstock.${index}.protein`)}
        onChange={(selectedProtein) => {
          form
            .getInputProps(`newBackstock.${index}.protein`)
            .onChange(selectedProtein);

          setFlavorSelectData((current) => {
            const copy = [...current];

            if (!selectedProtein) {
              copy[item.key] = [];
              return copy;
            }

            const proteinData = proteinsWithFlavors.find(
              (pData) => pData.proteinName === selectedProtein
            );
            if (!proteinData) {
              throw new Error(
                `Could not find protein data for this protein: ${selectedProtein}`
              );
            }

            copy[item.key] = proteinData.flavors
              ? proteinData.flavors.map((fData) => ({
                  value: fData.name,
                  label: fData.label,
                }))
              : null;
            return copy;
          });
        }}
      />
      <Tooltip
        disabled={
          flavorSelectData[item.key] === null ||
          (flavorSelectData[item.key] ?? []).length !== 0
        }
        label={"Select a protein"}
      >
        <Select
          placeholder={flavorSelectData[item.key] === null ? "n/a" : "Flavor"}
          data={flavorSelectData[item.key] ?? []}
          disabled={(flavorSelectData[item.key] ?? []).length === 0}
          searchable
          required={(flavorSelectData[item.key] ?? []).length !== 0}
          key={form.key(`newBackstock.${index}.flavor`)}
          {...form.getInputProps(`newBackstock.${index}.flavor`)}
        />
      </Tooltip>
      <NumberInput
        placeholder="Weight (oz)"
        required
        key={form.key(`newBackstock.${index}.weight`)}
        {...form.getInputProps(`newBackstock.${index}.weight`)}
        suffix=" oz"
        hideControls
      />
      {index === 0 ? (
        <ActionIcon variant="outline" onClick={handleAddField}>
          <IconPlus />
        </ActionIcon>
      ) : (
        <ActionIcon
          variant="outline"
          color="red"
          onClick={() => handleRemoveField(index, item.key)}
        >
          <IconTrash />
        </ActionIcon>
      )}
    </Group>
  ));

  const handleSubmit = async (values: typeof form.values) => {
    const newBackstock: InsertBackstockRow[] = values.newBackstock.map(
      (value) => camelToSnake<InsertBackstockRow>(value)
    );

    insertBackstockMutation.mutate(newBackstock, {
      onSuccess: () => {
        notifications.show({
          withCloseButton: true,
          color: "green",
          title: "Backstock Updated",
          message: "The new row(s) of backstock have been submitted",
        });

        handleClose();
      },
      onError: (error) => {
        console.warn("Error adding to backstock: ", error.message);
        notifications.show({
          withCloseButton: true,
          color: "red",
          title: "Adding to backstock failed",
          message: error.message,
        });
      },
    });
  };

  return (
    <Modal opened={opened} onClose={handleClose} size={modalSize}>
      <Stack>
        <ModalHeader />
        <FormWithDisable
          submitButtonLabels={{
            label: "Add",
            disabledLabel: "Adding...",
          }}
          submitButtonStyle={{}}
          onSubmit={form.onSubmit(handleSubmit)}
        >
          {formFields}
        </FormWithDisable>
      </Stack>
    </Modal>
  );
}
