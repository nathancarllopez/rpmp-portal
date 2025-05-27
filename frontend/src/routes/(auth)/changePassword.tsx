import Subtitle from "@/routes/-components/Subtitle";
import { notifications } from "@mantine/notifications";
import { hasLength, matchesField, useForm } from "@mantine/form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Container, PasswordInput, Title } from "@mantine/core";
import getSession from "@/integrations/supabase/auth/getSession";
import FormWithDisable from "../-components/FormWithDisable";
import changePassword from "@/integrations/supabase/auth/changePassword";

export const Route = createFileRoute("/(auth)/changePassword")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      notifications.show({
        withCloseButton: true,
        color: "red",
        title: "Authentication Required",
        message: "You must be logged in to access this page.",
      });
      throw redirect({ to: "/login" });
    }
  },
  component: ChangePassword,
});

function ChangePassword() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: hasLength({ min: 6 }, "Password must be at least 6 characters"),
      confirmPassword: matchesField("password", "Passwords are not the same"),
    },
    validateInputOnBlur: true,
  });

  const navigate = useNavigate();
  const handleSubmit = async (values: typeof form.values) => {
    try {
      const { password } = values;
      await changePassword(password);

      notifications.show({
        withCloseButton: true,
        color: "green",
        title: "Password Changed",
        message: "You have successfully updated your password!",
      });

      await navigate({ to: "/home" });
    } catch (error) {
      notifications.show({
        withCloseButton: true,
        color: "red",
        title: "Error updating password",
        message: `${error}`,
      });
    }
  };

  return (
    <Container size={460} my={50}>
      <Title ta="center" my={5}>
        Change your password
      </Title>
      <Subtitle>Enter your new password below</Subtitle>

      <FormWithDisable
        margins={{ mt: 50 }}
        submitButtonLabels={{
          label: "Change Password",
          disabledLabel: "Changing Password...",
        }}
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <PasswordInput
          label="New Password"
          name="password"
          required
          key={form.key("password")}
          {...form.getInputProps("password")}
        />
        <PasswordInput
          mt="md"
          label="Confirm New Password"
          name="confirmPassword"
          required
          key={form.key("confirmPassword")}
          {...form.getInputProps("confirmPassword")}
        />
      </FormWithDisable>
    </Container>
  );
}
