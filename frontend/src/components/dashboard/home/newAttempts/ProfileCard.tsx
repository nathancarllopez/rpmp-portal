// import {
//   ActionIcon,
//   Collapse,
//   Divider,
//   Group,
//   Paper,
//   Stack,
//   Text,
//   Title,
// } from "@mantine/core";
// import type { Profile } from "@rpmp-portal/types";
// import { useSuspenseQuery } from "@tanstack/react-query";
// import { profilePicOptions } from "@/integrations/tanstack-query/queries/profilePic";
// import { useDisclosure } from "@mantine/hooks";
// import { IconEdit, IconX } from "@tabler/icons-react";
// import ProfileInfoTable from "./ProfileInfoTable";
// import EditProfileForm from "./EditProfileForm";
// import ProfilePicDropzone from "./ProfilePicDropzone";

// interface ProfileCardProps {
//   profile: Profile;
//   showAdminControls: boolean;
//   viewingOwnProfile: boolean;
// }

// export default function ProfileCard({
//   profile,
//   showAdminControls,
//   viewingOwnProfile,
// }: ProfileCardProps) {
//   const [editing, { toggle }] = useDisclosure(false);

//   const { data: profilePicSrc, error: profilePicError } = useSuspenseQuery(
//     profilePicOptions(profile.userId)
//   );

//   const errors = [profilePicError].filter((error) => !!error);
//   if (errors.length > 0) {
//     return (
//       <Paper>
//         <Text>Errors fetching profile info</Text>
//         {errors.map((error, index) => (
//           <Text key={index}>{error.message}</Text>
//         ))}
//       </Paper>
//     );
//   }

//   return (
//     <Paper>
//       <Group>
//         <ProfilePicDropzone
//           profileId={profile.userId}
//           profilePicSrc={profilePicSrc}
//           showDropzone={editing}
//         />

//         <Divider orientation="vertical" />

//         <Stack flex={1}>
//           <Group>
//             <Title mr={"auto"}>{profile.fullName}</Title>
//             <ActionIcon onClick={toggle} variant="default" radius={"md"}>
//               {editing ? <IconX /> : <IconEdit />}
//             </ActionIcon>
//           </Group>

//           <ProfileInfoTable profile={profile} />
//         </Stack>
//       </Group>

//       <Collapse in={editing}>
//         <Divider />

//         <EditProfileForm profile={profile} />
//       </Collapse>
//     </Paper>
//   );
// }
