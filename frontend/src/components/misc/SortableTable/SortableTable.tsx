// import { Badge, Group, Table, Text, UnstyledButton } from "@mantine/core";
// import {
//   IconChevronDown,
//   IconChevronUp,
//   IconSelector,
// } from "@tabler/icons-react";
// import { useMemo, useState } from "react";

// interface SortableTableProps<T extends { id: number; displayColor: string }> {
//   headerData: {
//     label: string;
//     name: keyof T;
//   }[];
//   rowData: T[];
// }

// export default function SortableTable<
//   T extends { id: number; displayColor: string }
// >({ headerData, rowData }: SortableTableProps<T>) {
//   const [sortBy, setSortBy] = useState<keyof T>(headerData[0].name);
//   const [reverseSort, setReverseSort] = useState(false);

//   const handleSort = (sortHeader: keyof T) => {
//     setReverseSort(sortHeader === sortBy ? !reverseSort : false);
//     setSortBy(sortHeader);
//   };

//   const sortedRowData = useMemo(() => {
//     const sortKeys: (keyof T)[] = [
//       sortBy,
//       ...headerData.map(({ name }) => name),
//     ];

//     return [...rowData].sort((rowA, rowB) => {
//       for (let i = 0; i < sortKeys.length; i++) {
//         const key = sortKeys[i];
//         const [valueA, valueB] = [rowA, rowB].map((row) => row[key]);

//         let compare = compareValues(valueA, valueB);

//         if (i === 0 && reverseSort) compare = -compare;

//         if (compare !== 0) return compare;
//       }
//       return 0;
//     });
//   }, [rowData, sortBy, reverseSort]);

//   const headers = (
//     <Table.Tr>
//       {headerData.map((header) => (
//         <Table.Th key={header.label} p={0}>
//           <UnstyledButton onClick={() => handleSort(header.name)} p={"sm"}>
//             <Group justify="space-between">
//               {header.label}
//               {sortBy === header.name ? (
//                 reverseSort ? (
//                   <IconChevronUp />
//                 ) : (
//                   <IconChevronDown />
//                 )
//               ) : (
//                 <IconSelector />
//               )}
//             </Group>
//           </UnstyledButton>
//         </Table.Th>
//       ))}
//     </Table.Tr>
//   );

//   const rows = sortedRowData.map((row) => (
//     <Table.Tr key={row.id}>
//       {headerData.map(({ name }, index) => (
//         <Table.Td key={String(name)}>
//           {index === 0 ? (
//             <Badge color={row?.displayColor}>
//               <Text>{String(row[name])}</Text>
//             </Badge>
//           ) : (
//             <Text>{String(row[name])}</Text>
//           )}
//         </Table.Td>
//       ))}
//     </Table.Tr>
//   ));

//   return (
//     <Table highlightOnHover>
//       <Table.Thead>{headers}</Table.Thead>
//       <Table.Tbody>{rows}</Table.Tbody>
//     </Table>
//   );
// }

// function compareValues(valueA: any, valueB: any): number {
//   if (typeof valueA !== typeof valueB) {
//     console.warn("These values have different types:");
//     console.warn(valueA, valueB);
//     console.warn(JSON.stringify(typeof valueA), JSON.stringify(typeof valueB));
//     throw new Error("Mismatch type")
//   }
  
//   let compare = 0;

//   if (Array.isArray(valueA) && Array.isArray(valueB)) {
//     compare = compareArrays(valueA, valueB);
//   } else if (valueA instanceof Date && valueB instanceof Date) {
//     compare = valueA.getTime() - valueB.getTime();
//   } else if (typeof valueA === "boolean" && typeof valueB === "boolean") {
//     compare = Number(valueA) - Number(valueB);
//   } else if (typeof valueA === "string" && typeof valueB === "string") {
//     compare = valueA.localeCompare(valueB);
//   } else if (typeof valueA === "number" && typeof valueB === "number") {
//     compare = valueA - valueB;
//   } else {
//     console.warn("These values have an unexpected type:");
//     console.warn(valueA, valueB);
//     console.warn(typeof valueA);
//     throw new Error("Unexpected type");
//   }

//   return compare;
// }

// function compareArrays(arrA: any[], arrB: any[]): number {
//   if (arrA.length !== arrB.length) {
//     throw new Error('Arrays not of the same length');
//   }
//   const sharedLength = arrA.length;

//   if (sharedLength === 0) return 0;

//   // Let's assume the arrays have been sorted
//   for (let i = 0; i < sharedLength; i++) {
//     const compare = compareValues(arrA[i], arrB[i]);
//     if (compare !== 0) return compare;
//   }

//   return 0;
// }