import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import type { Profile } from "@/integrations/supabase/types/types";
import { allProfilesOptions } from "@/integrations/tanstack-query/queries/allProfiles";
import {
  ActionIcon,
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconInfoCircle,
  IconSearch,
  IconX,
  IconZoomExclamation,
} from "@tabler/icons-react";

import ViewEditProfile from "./-components/ViewEditProfile";
import CreateModal from "./-components/employees/CreateModal";

export const Route = createFileRoute("/_dashboard/employees")({
  component: RouteComponent,
});

function RouteComponent() {
  const [opened, { open, close }] = useDisclosure(false);
  const atSmallBp = useMediaQuery("(min-width: 48em)");
  const [searchValue, setSearchValue] = useState("");

  const { status, data, error } = useQuery(allProfilesOptions());

  const profiles =
    status === "success"
      ? data.filter((profile) => {
          if (!searchValue) return true;

          const profileKeys = Object.keys(profile) as (keyof Profile)[];
          return profileKeys.some((key) => {
            const profileVal = (profile[key] ?? "").toString().toLowerCase();
            return profileVal.includes(searchValue.toLowerCase());
          });
        })
      : [];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchValue(event.target.value);

  console.log(status);

  return (
    <Stack>
      <CreateModal
        opened={opened}
        handleClose={close}
        setSearchValue={setSearchValue}
      />

      <Group>
        <Title>Employees</Title>
        <Button ms={"auto"} onClick={open}>
          Add New
        </Button>
      </Group>

      <TextInput
        autoFocus
        radius={"xl"}
        size={atSmallBp ? "lg" : "md"}
        value={searchValue}
        placeholder="Search"
        onChange={handleSearchChange}
        leftSection={<IconSearch />}
        rightSection={
          <ActionIcon
            onClick={() => setSearchValue("")}
            radius={"xl"}
            variant="filled"
            style={{
              pointerEvents: searchValue ? "auto" : "none",
            }}
          >
            {searchValue ? <IconX /> : <IconArrowRight />}
          </ActionIcon>
        }
      />

      {status === "pending" && (
        <Center mt={"xl"}>
          <Loader />
        </Center>
      )}

      {status === "error" && (
        <Alert
          variant="outline"
          color="red"
          radius="md"
          withCloseButton
          title="Search Error"
          icon={<IconInfoCircle />}
        >
          Something went wrong: {error.message}
        </Alert>
      )}

      {status === "success" && profiles.length === 0 && (
        <Center mt={"xl"}>
          <Group>
            <Title order={2}>No results</Title>
            <IconZoomExclamation size={25} />
          </Group>
        </Center>
      )}

      {profiles.map((profile) => (
        <ViewEditProfile
          key={profile.id}
          profileToDisplay={profile}
          showAdminControls={true}
        />
      ))}
    </Stack>
  );
}
