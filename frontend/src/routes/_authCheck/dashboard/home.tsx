import ViewEditProfile from '@/components/dashboard/home/ViewEditProfile';
import LoadingScreen from '@/components/misc/LoadingScreen';
import { profileByIdOptions } from '@/integrations/tanstack-query/queries/profileById';
import { profilePicOptions } from '@/integrations/tanstack-query/queries/profilePic';
import { Stack, Text, Title } from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authCheck/dashboard/home')({
  loader: ({ context }) => {
    const { userId, queryClient } = context;
    
    queryClient.ensureQueryData(profileByIdOptions(userId));
    queryClient.ensureQueryData(profilePicOptions(userId));
  },
  pendingComponent: LoadingScreen,
  component: Home,
})

function Home() {
  const { userId } = Route.useRouteContext();
  const { data: profile, error: profileError } = useSuspenseQuery(profileByIdOptions(userId))

  const errors = [profileError].filter((error) => !!error);
  if (errors.length > 0) {
    return (
      <Stack>
        <Text>Errors fetching profile info</Text>
        {errors.map((error, index) => (
          <Text key={index}>{error.message}</Text>
        ))}
      </Stack>
    );
  }

  const showAdminControls = ["admin", "owner"].includes(profile.role);

  return (
    <Stack>
      <Title>Home</Title>

      <ViewEditProfile
        profileToDisplay={profile}
        showAdminControls={showAdminControls}
        userId={userId}
      />

      <Title>Timecards</Title>
    </Stack>
  );
}
