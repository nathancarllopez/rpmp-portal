import type { UserRole } from "@/integrations/supabase/types/types.ts";
import {
  AppShell,
  Avatar,
  Divider,
  NavLink,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBooks,
  IconChevronRight,
  IconLogout2,
  IconReceiptDollar,
  IconSettings,
  IconToolsKitchen3,
} from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
import NavLinkLabel from "./NavLinkLabel.tsx";
import { useAuth } from "@/integrations/supabase/auth/AuthProvider.tsx";
import useProfilePic from "@/integrations/tanstack-query/useProfilePic.ts";

interface NavLinkInfo {
  id: string;
  label: React.ReactNode;
  icon: React.ReactNode;
  href: string;
  hasPermission: UserRole[];
}

const ALL_NAV_LINKS: NavLinkInfo[] = [
  {
    id: "orders",
    label: "Orders",
    icon: <IconToolsKitchen3 />,
    href: "/orders",
    hasPermission: ["admin", "owner", "manager"],
  },
  {
    id: "timecards",
    label: "Timecards",
    icon: <IconReceiptDollar />,
    href: "/timecards",
    hasPermission: ["admin", "owner", "manager", "employee"],
  },
  {
    id: "finances",
    label: "Finances",
    icon: <IconBooks />,
    href: "/finances",
    hasPermission: ["admin", "owner",],
  },
];

export default function Navbar({
  closeOnMobile,
}: {
  closeOnMobile: () => void;
}) {
  const router = useRouter();
  const { profile, doLogout } = useAuth();
  const { data } = useProfilePic(profile?.userId);

  const navLinks = ALL_NAV_LINKS.filter((link) =>
    link.hasPermission.includes((profile?.role || "employee") as UserRole)
  );

  const handleLogoutClick = async () => {
    notifications.show({
      withCloseButton: true,
      color: "green",
      title: "Logging out",
      message: "See you next time!",
    });

    await doLogout();
    await router.invalidate();
  }

  return (
    <>
      <AppShell.Section>
        <NavLink
          label={
            <NavLinkLabel
              label={
                <Skeleton visible={!profile}>
                  <Text size="md">{profile?.fullName}</Text>

                  <Text c="dimmed" size="xs">
                    {profile?.email}
                  </Text>
                </Skeleton>
              }
            />
          }
          leftSection={
            <Skeleton visible={!profile}>
              {data ? (
                <Avatar
                  src={data}
                  alt={profile?.fullName}
                />
              ) : (
                <Avatar
                  name={profile?.fullName}
                  color="initials"
                />
              )}
            </Skeleton>
          }
          rightSection={<IconChevronRight size={14} />}
          component={Link}
          to="/profile"
          onClick={closeOnMobile}
        />
      </AppShell.Section>

      <Divider my="md" />

      <AppShell.Section grow>
        <Stack>
          {navLinks.map((link) => (
            <NavLink
              key={link.id}
              label={<NavLinkLabel label={link.label} />}
              leftSection={link.icon}
              ml={"xs"}
              component={Link}
              to={link.href}
              onClick={closeOnMobile}
            />
          ))}
        </Stack>
      </AppShell.Section>

      <Divider my="md" />

      <AppShell.Section mb={"md"}>
        <Stack>
          <NavLink
            label={<NavLinkLabel label="Settings" />}
            leftSection={<IconSettings />}
            component={Link}
            to="/settings"
            onClick={closeOnMobile}
          />
          <NavLink
            label={<NavLinkLabel label="Log out" />}
            leftSection={<IconLogout2 />}
            component={Link}
            to="/loggedOut"
            onClick={handleLogoutClick}
          />
        </Stack>
      </AppShell.Section>
    </>
  );
}
