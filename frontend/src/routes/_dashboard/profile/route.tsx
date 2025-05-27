import { useAuth } from "@/integrations/supabase/auth/AuthProvider";
import { Group, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import ViewEditProfile from "./-components/ViewEditProfile";
import { useMediaQuery } from "@mantine/hooks";

export const Route = createFileRoute("/_dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const hasEditAccess = ["admin", "owner"].includes(profile?.role || "employee");
  const atSmallBp = useMediaQuery("(min-width: 48em)");

  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Determine which value to select based on the current route
  const currentSegment = pathname.startsWith("/profile/create")
    ? "create"
    : pathname.startsWith("/profile/search")
    ? "search"
    : "view/edit";

  const handleChange = (value: string) => {
    if (value === "view/edit") {
      navigate({ to: "/profile" });
    } else if (value === "create") {
      navigate({ to: "/profile/create" });
    } else if (value === "search") {
      navigate({
        to: "/profile/search",
        search: (prev) => ({ ...prev, query: "" }),
      });
    }
  };

  return (
    <Stack>
      <Group justify={atSmallBp ? "space-between" : "center"}>
        <Title visibleFrom="sm">Profile</Title>

        {hasEditAccess && (
          <SegmentedControl
            value={currentSegment}
            onChange={handleChange}
            data={[
              { value: "view/edit", label: <Text>View/Edit</Text> },
              { value: "create", label: <Text>Create</Text> },
              { value: "search", label: <Text>Search</Text> },
            ]}
          />
        )}
      </Group>

      {hasEditAccess ? (
        <Outlet />
      ) : (
        <ViewEditProfile profile={profile} showAdminControls={false} />
      )}
    </Stack>
  );
}


// function ProfilePage() {
//   const navigate = useNavigate();
//   const { profile } = useAuth();
//   const hasEditAccess = ["admin", "owner"].includes(
//     profile?.role || "employee"
//   );
//   const atSmallBp = useMediaQuery("(min-width: 48em)");

//   return (
//     <Stack>
//       <Group justify={atSmallBp ? "space-between" : "center"}>
//         <Title visibleFrom="sm">Profile</Title>

//         {hasEditAccess && (
//           <SegmentedControl
//             data={[
//               {
//                 value: "view/edit",
//                 label: (
//                   <Text onClick={() => navigate({ to: "/profile" })}>
//                     View/Edit
//                   </Text>
//                 ),
//               },
//               {
//                 value: "create",
//                 label: (
//                   <Text onClick={() => navigate({ to: "/profile/create" })}>
//                     Create
//                   </Text>
//                 ),
//               },
//               {
//                 value: "search",
//                 label: (
//                   <Text
//                     onClick={() =>
//                       navigate({
//                         to: "/profile/search",
//                         search: (prev) => ({ ...prev, query: "" }),
//                       })
//                     }
//                   >
//                     Search
//                   </Text>
//                 ),
//               },
//             ]}
//           />
//         )}
//       </Group>

//       {hasEditAccess ? (
//         <Outlet />
//       ) : (
//         <ViewEditProfile profile={profile} showAdminControls={false} />
//       )}
//     </Stack>
//   );
// }
