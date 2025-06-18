// import capitalize from "@/util/capitalize";
// import { NumberFormatter, Table } from "@mantine/core";
// import type { Profile } from "@rpmp-portal/types";

// interface ProfileInfoTableProps {
//   profile: Profile;
// }

// export default function ProfileInfoTable({ profile }: ProfileInfoTableProps) {
//   const profileInfo: { header: string; data: React.ReactNode }[] = [
//     { header: "Email", data: profile.email },
//     { header: "Role", data: capitalize(profile.role || "employee") },
//     {
//       header: "Kitchen Rate",
//       data: profile.kitchenRate ? (
//         <NumberFormatter
//           prefix="$"
//           decimalScale={2}
//           fixedDecimalScale
//           value={profile.kitchenRate}
//         />
//       ) : (
//         "n/a"
//       ),
//     },
//     {
//       header: "Driving Rate",
//       data: profile.drivingRate ? (
//         <NumberFormatter
//           prefix="$"
//           decimalScale={2}
//           fixedDecimalScale
//           value={profile.drivingRate}
//         />
//       ) : (
//         "n/a"
//       ),
//     },
//   ];

//   return (
//     <Table variant="vertical">
//       <Table.Tbody>
//         {profileInfo.map(({ header, data }) => (
//           <Table.Tr key={header}>
//             <Table.Th>{header}</Table.Th>
//             <Table.Td>{data}</Table.Td>
//           </Table.Tr>
//         ))}
//       </Table.Tbody>
//     </Table>
//   );
// }
