import type { Profile } from '@/integrations/supabase/types/types';
import { allProfilesOptions } from '@/integrations/tanstack-query/queries/allProfiles';
import { ActionIcon, Alert, Button, Center, Group, Loader, Stack, TextInput, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowRight, IconInfoCircle, IconSearch, IconX, IconZoomExclamation } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import ViewEditProfile from '../profile/-components/ViewEditProfile';

export const Route = createFileRoute('/_dashboard/employees')({
  component: RouteComponent,
})

function RouteComponent() {
  const atSmallBp = useMediaQuery("(min-width: 48em)");
  const [searchValue, setSearchValue] = useState("");

  const { status, data, error } = useQuery(allProfilesOptions());

  const filtered = status === "success" ? data.filter((profile) => {
    if (!searchValue) return true;

    const profileKeys = Object.keys(profile) as (keyof Profile)[];
    return profileKeys.some((key) => {
      const profileVal = (profile[key] ?? "").toString().toLowerCase();
      return profileVal.includes(searchValue.toLowerCase());
    });
  }) : [];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value);

  return (
    <Stack>
      <Group>
        <Title>Employees</Title>
        <Button ms={'auto'}>Add New</Button>
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

      { status === 'pending' && (
        <Center mt={'xl'}><Loader/></Center>
      ) }

      { status === 'error' && (
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
      ) }

      { filtered.length > 0 ? (
        filtered.map((profile) => (
          <ViewEditProfile
            key={profile.id}
            profileToDisplay={profile}
            showAdminControls={true}
          />
        ))
      ) : (
        <Center mt={'xl'}>
          <Group>
            <Title order={2}>No results</Title>
            <IconZoomExclamation size={25} />
          </Group>
        </Center>
      ) }

    </Stack>
  );
}
