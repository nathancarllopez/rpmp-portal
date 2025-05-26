import { notifications } from "@mantine/notifications";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useDisclosure } from "@mantine/hooks";
import {
  AppShell,
  Burger,
  Container,
  Group,
  Title,
  UnstyledButton,
} from "@mantine/core";
import Navbar from "./-components/Navbar.tsx";
import ColorSchemeToggle from "./-components/ColorSchemeToggle.tsx";
import getSession from "@/integrations/supabase/auth/getSession.ts";
import getProfile from "@/integrations/supabase/auth/getProfile.ts";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ context, location }) => {
    const { isAuthenticated, setProfile, logout } = context.authCtx;

    if (isAuthenticated) return;

    const session = await getSession();
    if (session) {
      try {
        const userId = session.user.id;
        const profile = await getProfile(userId);

        setProfile(profile);

        throw redirect({ to: location.href });
      } catch (error) {
        console.warn(`Error logging in: ${error}`);

        notifications.show({
          withCloseButton: true,
          color: "red",
          title: "Error logging in",
          message: "You'll be logged out and sent back to the login page...",
        });

        await logout();

        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }
    }

    notifications.show({
      withCloseButton: true,
      color: "red",
      title: "Authentication Required",
      message: "You must be logged in to access this page.",
    });
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  },
  component: Dashboard,
});

function Dashboard() {
  const [mobileOpened, { toggle: toggleMobile, close: closeOnMobile }] =
    useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 90 }}
      navbar={{
        width: 325,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h={"100%"} px={"sm"}>
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />

          <UnstyledButton
            component={Link}
            to={"/home"}
            mr={"auto"}
            onClick={closeOnMobile}
          >
            <Title visibleFrom="sm">RPMP Portal</Title>
            <Title hiddenFrom="sm">RPMP</Title>
          </UnstyledButton>

          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Navbar closeOnMobile={closeOnMobile} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
