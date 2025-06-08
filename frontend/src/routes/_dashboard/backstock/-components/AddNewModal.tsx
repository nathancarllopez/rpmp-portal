import {
  insertBackstock,
  type NewBackstockInfo,
} from "@/integrations/supabase/database/insertBackstock";
import { useProteinsWithFlavors } from "@/integrations/tanstack-query/useProteinsWithFlavors";
import FormWithDisable from "@/routes/-components/FormWithDisable";
import {
  ActionIcon,
  Button,
  Center,
  CloseButton,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCounter } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconRestore, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface AddNewModalProps {
  opened: boolean;
  handleClose: () => void;
}

interface FlavorData {
  value: string;
  label: string;
}

type FlavorSelectData = FlavorData[] | null;

export default function AddNewModal({ opened, handleClose }: AddNewModalProps) {
  const [count, { increment }] = useCounter(0);
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

  const [flavorSelectData, setFlavorSelectData] = useState<FlavorSelectData[]>([
    [],
  ]);
  const { data, error } = useProteinsWithFlavors();
  const proteinsWithFlavors = data || [];
  const queryClient = useQueryClient();

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

  const handleResetFields = () => {
    form.reset();
    setFlavorSelectData([[]]);
  };

  const ModalTitle = () => (
    <Group>
      <Title>Add New Backstock</Title>
      <CloseButton size={'lg'} ms='auto' onClick={handleClose}/>
    </Group>
  );

  const modalSize = 800;
  if (!data) {
    return (
      <Modal
        opened={opened}
        onClose={handleClose}
        withCloseButton={false}
        size={modalSize}
        padding={0}
      >
        <ModalTitle />
        <Center>
          <Loader />
        </Center>
      </Modal>
    );
  }

  const formFields = form.getValues().newBackstock.map((item, index) => (
    <Group key={item.key} mb={"md"} justify="space-between">
      <Select
        placeholder="Protein"
        data={proteinsWithFlavors.map((row) => ({
          value: row.name,
          label: row.label,
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
              (item) => item.name === selectedProtein
            );
            if (!proteinData) {
              throw new Error(
                `Could not find protein data for this protein: ${selectedProtein}`
              );
            }

            copy[item.key] = proteinData.flavors;
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
          placeholder={flavorSelectData[item.key] === null ? "N/A" : "Flavor"}
          data={flavorSelectData[item.key] ?? []}
          disabled={(flavorSelectData[item.key] ?? []).length === 0}
          searchable
          required
          key={form.key(`newBackstock.${index}.flavor`)}
          {...form.getInputProps(`newBackstock.${index}.flavor`)}
        />
      </Tooltip>
      <NumberInput
        placeholder="Weight (oz)"
        required
        key={form.key(`newBackstock.${index}.weight`)}
        {...form.getInputProps(`newBackstock.${index}.weight`)}
        me={index === 0 ? 45 : undefined}
        suffix=" oz"
        hideControls
      />
      {index !== 0 && (
        <ActionIcon variant="outline" color="red" onClick={() => handleRemoveField(index, item.key)}>
          <IconTrash />
        </ActionIcon>
      )}
    </Group>
  ));

  const handleSubmit = async (values: typeof form.values) => {
    const newBackstock: NewBackstockInfo[] = values.newBackstock.map(
      (value) => {
        return {
          protein: value.protein,
          flavor: value.flavor,
          weight: Number(value.weight),
        };
      }
    );

    try {
      await insertBackstock(newBackstock);

      notifications.show({
        withCloseButton: true,
        color: "green",
        title: "Backstock Updated",
        message: "The new row(s) of backstock have been submitted",
      });

      queryClient.invalidateQueries({ queryKey: ["backstock"] });
    } catch (error) {
      if (error instanceof Error) {
        console.warn("Error adding to backstock: ", error.message);
      } else {
        console.warn(
          "Unkown error adding to backstock: ",
          JSON.stringify(error)
        );
      }

      notifications.show({
        withCloseButton: true,
        color: "red",
        title: "Adding to backstock failed",
        message: `${(error as Error)?.message || JSON.stringify(error)}`,
      });
    } finally {
      handleClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      size={modalSize}
      padding={0}
    >
      {error ? (
        <Paper>
          <Text>Error occurred while fetching protein/flavor data</Text>
          <Text>{error.message}</Text>
        </Paper>
      ) : (
        <Stack>
          <ModalTitle />
          <FormWithDisable
            submitButtonLabels={{
              label: "Add",
              disabledLabel: "Adding..."
            }}
            submitButtonStyle={{}}
            onSubmit={form.onSubmit(handleSubmit)}
          >
            <Group pb={'md'} justify="center">
              <Button
                leftSection={<IconPlus />}
                size="xs"
                variant="default"
                onClick={handleAddField}
              >
                Add Row
              </Button>
              <Button
                leftSection={<IconRestore />}
                size="xs"
                variant="default"
                onClick={handleResetFields}
              >
                Reset Rows
              </Button>
            </Group>
            {formFields}
          </FormWithDisable>
        </Stack>
        // <>
        //   <ModalTitle />
        //   <FormWithDisable
        //     submitButtonLabels={{
        //       label: "Add",
        //       disabledLabel: "Adding...",
        //     }}
        //     submitButtonStyle={{}}
        //     onSubmit={form.onSubmit(handleSubmit)}
        //   >
        //     {formFields}
        //   </FormWithDisable>
        // </>
      )}
    </Modal>
  );
}
