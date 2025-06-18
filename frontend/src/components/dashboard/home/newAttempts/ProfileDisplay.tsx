// import { profilePicOptions } from "@/integrations/tanstack-query/queries/profilePic";
// import capitalize from "@/util/capitalize";
// import {
//   ActionIcon,
//   AspectRatio,
//   Divider,
//   Group,
//   Image,
//   NumberFormatter,
//   Stack,
//   Table,
//   Text,
//   Title,
// } from "@mantine/core";
// import type { Profile } from "@rpmp-portal/types";
// import { IconEdit } from "@tabler/icons-react";
// import { useSuspenseQuery } from "@tanstack/react-query";

// interface ProfileDisplayProps {
//   displayProfile: Profile;
//   isEditing: boolean;
//   toggleEditForm: () => void;
// }

// export default function ProfileDisplay({
//   displayProfile,
//   isEditing,
//   toggleEditForm,
// }: ProfileDisplayProps) {
//   const { data: profilePicSrc, error: profileError } = useSuspenseQuery(
//     profilePicOptions(displayProfile.userId)
//   );

//   const errors = [profileError].filter((error) => !!error);
//   if (errors.length > 0) {
//     return (
//       <>
//         <Text>Error fetching profile data:</Text>
//         {errors.map((error, index) => (
//           <Text key={index}>{error.message}</Text>
//         ))}
//       </>
//     );
//   }

//   const profileInfo: { header: string; data: React.ReactNode }[] = [
//     { header: "Email", data: displayProfile.email },
//     { header: "Role", data: capitalize(displayProfile.role || "employee") },
//     {
//       header: "Kitchen Rate",
//       data: displayProfile.kitchenRate ? (
//         <NumberFormatter
//           prefix="$"
//           decimalScale={2}
//           fixedDecimalScale
//           value={displayProfile.kitchenRate}
//         />
//       ) : (
//         "n/a"
//       ),
//     },
//     {
//       header: "Driving Rate",
//       data: displayProfile.drivingRate ? (
//         <NumberFormatter
//           prefix="$"
//           decimalScale={2}
//           fixedDecimalScale
//           value={displayProfile.drivingRate}
//         />
//       ) : (
//         "n/a"
//       ),
//     },
//   ];

//   return (
//     <Group gap={"xl"}>
//       <AspectRatio ratio={1} w={{ base: "100%", sm: "33%" }}>
//         <Image src={profilePicSrc} radius={"50%"} />
//       </AspectRatio>

//       <Divider orientation="vertical" />

//       <Stack justify="center" flex={1}>
//         <Group>
//           <Title me={"auto"}>{displayProfile.fullName}</Title>
//           <ActionIcon
//             onClick={toggleEditForm}
//             variant="default"
//             radius={"md"}
//             size={"xl"}
//           >
//             <IconEdit />
//           </ActionIcon>
//         </Group>

//         <Table variant="vertical">
//           <Table.Tbody>
//             {profileInfo.map(({ header, data }) => (
//               <Table.Tr key={header}>
//                 <Table.Th>{header}</Table.Th>
//                 <Table.Td>{data}</Table.Td>
//               </Table.Tr>
//             ))}
//           </Table.Tbody>
//         </Table>
//       </Stack>
//     </Group>
//   );
// }
