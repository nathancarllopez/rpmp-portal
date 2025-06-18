// import SortableTable from "@/components/misc/SortableTable/SortableTable";
// import { proteinsOptions } from "@/integrations/tanstack-query/queries/proteins";
// import type { ProteinRow } from "@rpmp-portal/types";
// import { useSuspenseQuery } from "@tanstack/react-query";

// export default function ProteinTable() {
//   const { data: proteinRows, error: proteinError } = useSuspenseQuery({
//     ...proteinsOptions(),
//     select: (data) => data.map((row) => ({
//       ...row,
//       flavors: (row.flavors ?? []).map((fRow) => {
//         return fRow
//       })
//     })),
//   });

//   const errors = [proteinError].filter((err) => err !== null);
//   if (errors.length > 0) {
//     return (
//       <div>Error message</div>
//     );
//   }

//   const headerData: { label: string, name: keyof ProteinRow }[] = [
//     { label: "Protein", name: "label" },
//     { label: "Flavors", name: "flavors" },
//     { label: "Shrink", name: "shrink" },
//     { label: "Color", name: "displayColor" },
//   ];

//   return (
//     <SortableTable<ProteinRow>
//       headerData={headerData}
//       rowData={proteinRows}  
//     />
//   );
// }

// // import { Group, Table, UnstyledButton } from "@mantine/core";
// // import type { ProteinRow } from "@rpmp-portal/types";
// // import { IconChevronDown, IconChevronUp, IconSelector } from "@tabler/icons-react";
// // import { useMemo, useState } from "react";

// // const proteinHeaders: {
// //   key: number;
// //   label: string;
// //   sortBy: keyof ProteinRow;
// // }[] = [
// //   { key: 0, label: "Protein", sortBy: "name" },
// //   { key: 0, label: "Label", sortBy: "label" },
// //   { key: 0, label: "Flavors", sortBy: "flavors" },
// //   { key: 0, label: "Shrink", sortBy: "shrink" },
// //   { key: 0, label: "Color", sortBy: "displayColor" },
// // ];

// // interface ProteinTableProps {}

// // export default function ProteinTable({}: ProteinTableProps) {
// //   const [sortBy, setSortBy] = useState<keyof ProteinRow>("name");
// //   const [reverseSort, setReverseSort] = useState(false);

// //   const sortedProteins = useMemo(() => {}, [])

// //   const handleSort = (sortHeader: keyof ProteinRow) => {};

// //   const headers = (
// //     <Table.Tr>
// //       {proteinHeaders.map((header) => (
// //         <Table.Th key={header.key} p={0}>
// //           <UnstyledButton onClick={() => handleSort(header.sortBy)} p={"sm"}>
// //             <Group justify="space-between">
// //               {header.label}
// //               {sortBy === header.sortBy ? (
// //                 reverseSort ? (
// //                   <IconChevronUp />
// //                 ) : (
// //                   <IconChevronDown />
// //                 )
// //               ) : (
// //                 <IconSelector />
// //               )}
// //             </Group>
// //           </UnstyledButton>
// //         </Table.Th>
// //       ))}
// //     </Table.Tr>
// //   );

// //   return (
// //     <Table highlightOnHover>
// //       <Table.Thead>{headers}</Table.Thead>
// //       <Table.Tbody></Table.Tbody>
// //     </Table>
// //   );
// // }
