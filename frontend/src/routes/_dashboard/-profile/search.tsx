import useDebounce from "@/hooks/useDebounce";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "@/integrations/supabase/types/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { allProfilesOptions } from "@/integrations/tanstack-query/queries/allProfiles";
import {
  ActionIcon,
  Alert,
  Center,
  Group,
  Paper,
  Skeleton,
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

type ProfileSearch = {
  profileQuery: string;
};

export const Route = createFileRoute("/_dashboard/profile/search")({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => {
    return {
      profileQuery: (search.profileQuery as string) || "",
    };
  },
  component: SearchProfiles,
});

function SearchProfiles() {
  const navigate = useNavigate({ from: "/profile/search" });
  const atSmallBp = useMediaQuery("(min-width: 48em)");
  const { profileQuery } = Route.useSearch();
  const debQuery = useDebounce(profileQuery, 100);
  const filterQuery = debQuery.toLowerCase();

  const { isPending, data, error } = useQuery(allProfilesOptions());

  const filteredProfiles = (data ?? []).filter((profile) => {
    if (!filterQuery) return true;

    const profileKeys = Object.keys(profile) as (keyof Profile)[];
    return profileKeys.some((key) => {
      const value = (profile[key] ?? "").toString();
      return value.toLowerCase().includes(filterQuery);
    });
  });

  const handleClearSearch = () => {
    if (profileQuery) {
      navigate({
        search: (prev) => ({ ...prev, profileQuery: "" }),
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({
      search: (prev) => ({ ...prev, profileQuery: e.target.value }),
    });
  };

  return (
    <Stack>
      <Paper my={0}>
        <TextInput
          autoFocus
          radius={"xl"}
          size={atSmallBp ? "lg" : "md"}
          value={profileQuery}
          placeholder="Search"
          onChange={handleSearchChange}
          leftSection={<IconSearch />}
          rightSection={
            <ActionIcon
              onClick={handleClearSearch}
              radius={"xl"}
              variant="filled"
              style={{
                pointerEvents: profileQuery ? "auto" : "none",
              }}
            >
              {profileQuery ? <IconX /> : <IconArrowRight />}
            </ActionIcon>
          }
        />
      </Paper>

      {error && (
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

      <Skeleton visible={isPending}>
        {filteredProfiles.map((profile) => (
          <ViewEditProfile
            key={profile.id}
            profileToDisplay={profile}
            showAdminControls={true}
          />
        ))}
      </Skeleton>

      {!isPending && data?.length === 0 && (
        <Center mt={25}>
          <Group>
            <Title order={2}>No results</Title>
            <IconZoomExclamation size={25} />
          </Group>
        </Center>
      )}
    </Stack>
  );
}

// import useDebounce from "@/hooks/useDebounce";
// import getProfiles from "@/integrations/supabase/database/getProfiles";
// import {
//   ActionIcon,
//   Alert,
//   Center,
//   Group,
//   Paper,
//   Skeleton,
//   Stack,
//   TextInput,
//   Title,
// } from "@mantine/core";
// import { useMediaQuery } from "@mantine/hooks";
// import {
//   IconArrowRight,
//   IconInfoCircle,
//   IconSearch,
//   IconX,
//   IconZoomExclamation,
// } from "@tabler/icons-react";
// import { useQuery } from "@tanstack/react-query";
// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import ViewEditProfile from "./-components/ViewEditProfile";

// type ProfileSearch = {
//   query: string;
// };

// export const Route = createFileRoute("/_dashboard/profile/search")({
//   validateSearch: (search: Record<string, unknown>): ProfileSearch => {
//     return {
//       query: (search.query as string) || "",
//     };
//   },
//   component: SearchProfiles,
// });

// function SearchProfiles() {
//   const navigate = useNavigate({ from: "/profile/search" });
//   const { query } = Route.useSearch();
//   const debQuery = useDebounce(query, 100);

//   const { isPending, isError, data, error } = useQuery({
//     queryKey: ["profiles", debQuery],
//     queryFn: async () => await getProfiles(debQuery),
//   });

//   const atSmallBp = useMediaQuery("(min-width: 48em)");

//   const handleClearSearch = () => {
//     if (query) {
//       navigate({
//         search: (prev) => ({ ...prev, query: "" }),
//       });
//     }
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     navigate({
//       search: (prev) => ({ ...prev, query: e.target.value }),
//     });
//   };

//   return (
//     <Stack>
//       <Paper my={0}>
//         <TextInput
//           autoFocus
//           radius={"xl"}
//           size={atSmallBp ? "lg" : "md"}
//           value={query}
//           placeholder="Search"
//           onChange={handleSearchChange}
//           leftSection={<IconSearch />}
//           rightSection={
//             <ActionIcon
//               onClick={handleClearSearch}
//               radius={"xl"}
//               variant="filled"
//               style={{
//                 pointerEvents: query ? "auto" : "none",
//               }}
//             >
//               {query ? <IconX /> : <IconArrowRight />}
//             </ActionIcon>
//           }
//         />
//       </Paper>

//       {isError && (
//         <Alert
//           variant="outline"
//           color="red"
//           radius="md"
//           withCloseButton
//           title="Search Error"
//           icon={<IconInfoCircle />}
//         >
//           Something went wrong: {error.message}
//         </Alert>
//       )}

//       <Skeleton visible={isPending}>
//         {data?.map((profile) => (
//           <ViewEditProfile
//             key={profile.id}
//             profileToDisplay={profile}
//             showAdminControls={true}
//           />
//         ))}
//       </Skeleton>

//       {!isPending && data?.length === 0 && (
//         <Center mt={25}>
//           <Group>
//             <Title order={2}>No results</Title>
//             <IconZoomExclamation size={25} />
//           </Group>
//         </Center>
//       )}
//     </Stack>
//   );
// }
