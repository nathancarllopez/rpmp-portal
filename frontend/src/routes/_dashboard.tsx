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
import { useAuth } from "@/integrations/supabase/auth/AuthProvider.tsx";
import SkeletonDashboard from "./-components/SkeletonDashboard.tsx";
import LoadingScreen from "./-components/LoadingScreen.tsx";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: ({ context, location }) => {
    const { isAuthenticated, fetchingSession } = context.authCtx;

    if (fetchingSession) return;

    if (!isAuthenticated) {
      notifications.show({
        withCloseButton: true,
        color: "red",
        title: "Authentication Required",
        message: "You must be logged in to access this page.",
      });

      throw redirect({
        to: '/',
        search: {
          redirect: location.href
        }
      })
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const [mobileOpened, { toggle: toggleMobile, close: closeOnMobile }] =
    useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { showSkeleton, fetchingSession } = useAuth();

  if (fetchingSession) {
    return <LoadingScreen/>
  }

  if (showSkeleton) {
    return <SkeletonDashboard/>
  }

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
            <Title visibleFrom="sm">RPMP Dashboard</Title>
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
