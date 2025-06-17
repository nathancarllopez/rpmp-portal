import { Badge, Checkbox, ScrollArea, Table } from "@mantine/core";
import { useMemo, useState } from "react";
import cx from "clsx";
import classes from "./BackstockTable.module.css";
import { IconCheck } from "@tabler/icons-react";
import BackstockHeader from "./BackstockHeader";
import { useMediaQuery } from "@mantine/hooks";
import type { BackstockViewRow } from "@rpmp-portal/types";

interface BackstockTableProps {
  data: BackstockViewRow[];
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

const BACKSTOCK_HEADERS: {
  key: number;
  label: string;
  sortBy: keyof BackstockViewRow;
  visibleFrom: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
}[] = [
  { key: 0, label: "Protein", sortBy: "protein", visibleFrom: undefined },
  { key: 1, label: "Flavor", sortBy: "flavor", visibleFrom: undefined },
  { key: 2, label: "Weight", sortBy: "weight", visibleFrom: undefined },
  { key: 3, label: "Date Added", sortBy: "createdAt", visibleFrom: "sm" },
  { key: 4, label: "Claimed", sortBy: "available", visibleFrom: "sm" },
];

export default function BackstockTable({
  data,
  selectedIds,
  setSelectedIds,
}: BackstockTableProps) {
  const [scrolled, setScrolled] = useState(false);
  const [sortBy, setSortBy] = useState<keyof BackstockViewRow>("available");
  const [reverseSort, setReverseSort] = useState(false);
  const atSmallBp = useMediaQuery("(min-width: 48em)");

  const sortedData = useMemo(() => {
    // Helper to get the value for a given sort key
    const getValue = (row: BackstockViewRow, key: keyof BackstockViewRow) => {
      if (key === "createdAt") return new Date(row.createdAt).getTime();
      if (key === "weight") return row.weight;
      if (key === "available") return Number(row.available);
      return row[key];
    };

    // Compose the sort keys in order of priority
    const sortKeys: (keyof BackstockViewRow)[] = [
      sortBy,
      "protein",
      "flavor",
      "createdAt",
    ];

    return [...data].sort((rowA, rowB) => {
      for (let i = 0; i < sortKeys.length; i++) {
        const key = sortKeys[i];
        let compare = 0;
        if (key === "protein" || key === "flavor") {
          compare = String(getValue(rowA, key)).localeCompare(
            String(getValue(rowB, key))
          );
        } else if (key === "createdAt") {
          compare = Number(getValue(rowA, key)) - Number(getValue(rowB, key));
        } else if (key === "weight" || key === "available") {
          compare = Number(getValue(rowA, key)) - Number(getValue(rowB, key));
        } else {
          compare = String(getValue(rowA, key)).localeCompare(
            String(getValue(rowB, key))
          );
        }

        // For the primary sort key, apply reverseSort
        if (i === 0 && reverseSort) compare = -compare;

        if (compare !== 0) return compare;
      }
      return 0;
    });
  }, [data, sortBy, reverseSort]);

  const toggleRow = (rowId: number) =>
    setSelectedIds((current) => {
      const updated = new Set(current);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }
      return updated;
    });
  const toggleAll = () =>
    setSelectedIds((current) => {
      if (current.size > 0) {
        return new Set<number>();
      }
      return new Set(sortedData.map((row) => row.id));
    });
  const handleSort = (sortHeader: keyof BackstockViewRow) => {
    setReverseSort(sortHeader === sortBy ? !reverseSort : false);
    setSortBy(sortHeader);
  };

  const headers = BACKSTOCK_HEADERS.map((header) => (
    <BackstockHeader
      key={header.key}
      label={header.label}
      reversed={reverseSort}
      sorted={sortBy === header.sortBy}
      onSort={() => handleSort(header.sortBy)}
      visibleFrom={header.visibleFrom}
    />
  ));

  const rows = sortedData.map((row) => {
    const isSelected = selectedIds.has(row.id);
    return (
      <Table.Tr
        key={row.id}
        className={cx({ [classes.rowSelected]: isSelected })}
      >
        <Table.Td>
          <Checkbox checked={isSelected} onChange={() => toggleRow(row.id)} />
        </Table.Td>
        <Table.Td>
          <Badge color={row.displayColor} autoContrast>
            {row.protein}
          </Badge>
        </Table.Td>
        <Table.Td px={"md"}>{row.flavor}</Table.Td>
        <Table.Td>{row.weight} oz</Table.Td>
        {atSmallBp && (
          <>
            <Table.Td>{new Date(row.createdAt).toLocaleDateString()}</Table.Td>
            <Table.Td>
              {row.available ? null : <IconCheck size={15} />}
            </Table.Td>
          </>
        )}
      </Table.Tr>
    );
  });

  return (
    <ScrollArea
      h={600}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table highlightOnHover>
        <Table.Thead
          className={cx(classes.header, { [classes.scrolled]: scrolled })}
        >
          <Table.Tr>
            <Table.Th>
              <Checkbox
                onChange={toggleAll}
                checked={selectedIds.size === sortedData.length}
                indeterminate={
                  selectedIds.size > 0 && selectedIds.size !== sortedData.length
                }
              />
            </Table.Th>
            {headers}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
