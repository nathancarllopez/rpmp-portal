import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { allProfilesOptions } from "@/integrations/tanstack-query/queries/allProfiles";
import {
  ActionIcon,
  Alert,
  Button,
  Center,
  Group,
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

import type { Profile } from "@rpmp-portal/types";
import { rolesOptions } from "@/integrations/tanstack-query/queries/roles";
import CreateModal from "@/components/dashboard/employees/CreateModal";
import ViewEditProfile from "@/components/dashboard/home/ViewEditProfile";
import LoadingScreen from "@/components/misc/LoadingScreen";

export const Route = createFileRoute('/_authCheck/dashboard/employees')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(allProfilesOptions());
    queryClient.ensureQueryData(rolesOptions());
  },
  pendingComponent: LoadingScreen,
  component: Employees,
})

function Employees() {
  const { userId } = Route.useRouteContext();

  const [opened, { open, close }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState("");
  const atSmallBp = useMediaQuery("(min-width: 48em)");

  const { data: allProfiles, error } = useSuspenseQuery(allProfilesOptions());

  const profiles = useMemo(() => {
    return allProfiles.filter((profile) => {
      if (!searchValue) return true;

      const profileKeys = Object.keys(profile) as (keyof Profile)[];
      const keyMatchesSearch = (key: keyof Profile) => {
        const value = (profile[key] ?? "").toString().toLowerCase();
        return value.includes(searchValue.toLowerCase());
      }

      return profileKeys.some((key) => keyMatchesSearch(key));
    })
  }, [allProfiles, searchValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchValue(event.target.value);

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
        disabled={!!error}
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

      {!!error && (
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

      {profiles.length === 0 && (
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
          userId={userId}
        />
      ))}
    </Stack>
  );
}
