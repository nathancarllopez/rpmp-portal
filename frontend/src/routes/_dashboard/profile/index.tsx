import { useAuth } from "@/integrations/supabase/auth/AuthProvider";
import { createFileRoute } from "@tanstack/react-router";
import ViewEditProfile from "./-components/ViewEditProfile";

export const Route = createFileRoute("/_dashboard/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = useAuth();
  const showAdminControls = ["admin", "owner"].includes(
    profile?.role || "employee"
  );
  return (
    <ViewEditProfile profile={profile} showAdminControls={showAdminControls} />
  );
}
