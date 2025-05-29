import Subtitle from "@/routes/-components/Subtitle";
import { notifications } from "@mantine/notifications";
import { hasLength, isEmail, useForm } from "@mantine/form";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import {
  Anchor,
  Container,
  PasswordInput,
  TextInput,
  Title,
} from "@mantine/core";
import { useAuth } from "@/integrations/supabase/auth/AuthProvider";
import FormWithDisable from "../-components/FormWithDisable";

export const Route = createFileRoute("/(auth)/login")({
  beforeLoad: ({ context }) => {
    if (context.authCtx.isAuthenticated) {
      throw redirect({ to: "/home" });
    }
  },
  component: LoginForm,
});

function LoginForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: import.meta.env.VITE_DEFAULT_EMAIL,
      password: import.meta.env.VITE_DEFAULT_PASSWORD,
    },
    validate: {
      email: isEmail("Invalid email format"),
      password: hasLength({ min: 6 }, "Password must be at least 6 characters"),
    },
    validateInputOnBlur: true,
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (values: typeof form.values) => {
    try {
      const { email, password } = values;
      const user = await login(email, password);

      const firstLogin = !user.user_metadata.has_signed_in;
      if (firstLogin) {
        notifications.show({
          withCloseButton: true,
          color: "green",
          title: "Nice to meet you!",
          message: "Please update your password.",
        });

        await navigate({ to: "/changePassword" });
        return;
      }

      notifications.show({
        withCloseButton: true,
        color: "green",
        title: "Logged in!",
        message: "Loading profile information...",
      });

      await navigate({ to: "/home" });
    } catch (error) {
      notifications.show({
        withCloseButton: true,
        color: "red",
        title: "Error signing in",
        message: `${error}`,
      });
    }
  };

  return (
    <Container size={460} my={50}>
      <Title ta="center" my={5}>
        Welcome back!
      </Title>
      <Anchor component={Link} to="/resetPassword">
        <Subtitle>Forgot your password?</Subtitle>
      </Anchor>

      <FormWithDisable
        margins={{ mt: 50 }}
        submitButtonLabels={{
          label: "Sign In",
          disabledLabel: "Signing In...",
        }}
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <TextInput
          label="Email"
          name="email"
          autoComplete="email"
          required
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <PasswordInput
          mt="md"
          label="Password"
          name="password"
          required
          key={form.key("password")}
          {...form.getInputProps("password")}
        />
      </FormWithDisable>
    </Container>
  );
}
