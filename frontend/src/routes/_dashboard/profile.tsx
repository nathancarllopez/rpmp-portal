import { useAuth } from "@/integrations/supabase/auth/AuthProvider";
import { createFileRoute } from "@tanstack/react-router";
import ViewEditProfile from "./-components/ViewEditProfile";
import { Stack, Title } from "@mantine/core";

export const Route = createFileRoute("/_dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = useAuth();
  const showAdminControls = ["admin", "owner"].includes(
    profile?.role || "employee"
  );
  return (
    <Stack>
      <Title>My Profile</Title>

      <ViewEditProfile
        profileToDisplay={profile}
        showAdminControls={showAdminControls}
      />
    </Stack>
  );
}