import { ActionIcon } from "@mantine/core";
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from "@tabler/icons-react";

interface AsideToggleProps {
  asideOpened: boolean;
  toggle: () => void;
}

export default function AsideToggle({ asideOpened, toggle }: AsideToggleProps) {
  return (
    <ActionIcon onClick={toggle} variant="default" size="xl" radius="md">
      {asideOpened ? (
        <IconLayoutSidebarRightCollapse stroke={1.5} />
      ) : (
        <IconLayoutSidebarRightExpand stroke={1.5} />
      )}
    </ActionIcon>
  );
}
