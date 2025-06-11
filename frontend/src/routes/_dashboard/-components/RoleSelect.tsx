import type { UserRole } from "@/integrations/supabase/types/types";
import Subtitle from "@/routes/-components/Subtitle";
import { Select, Stack } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useState } from "react";

const roleExplanations: Record<UserRole, string> = {
  employee: "Here are all the things that an employee can do",
  manager: "Here are all the things that a manager can do",
  owner: "Here are all the things that an owner can do",
  admin: "Should only be for developers!!"
};

interface RoleSelectProps<T extends Record<string, any>> {
  form: UseFormReturnType<T>;
}

export default function RoleSelect<T extends Record<string, any>>({ form }: RoleSelectProps<T>) {
  const [explanation, setExplanation] = useState(roleExplanations["employee"]);

  const selectData = [
    { label: "Employee", value: "employee" },
    { label: "Manager", value: "manager" },
    { label: "Owner", value: "owner" },
    { label: "Admin", value: "admin", disabled: true }
  ];

  form.watch("role", ({ value }) => setExplanation(roleExplanations[value]));
  
  return (
    <Stack>
      <Select
        label="Dashboard Role"
        name="role"
        data={selectData}
        key={form.key("role")}
        { ...form.getInputProps("role") }
        
      />
      <Subtitle textAlign="start">{explanation}</Subtitle>
    </Stack>
  );
}