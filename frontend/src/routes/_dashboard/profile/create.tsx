import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createUser, type NewUserInfo } from "@/api/createUser";
import { Grid, NumberInput, TextInput } from "@mantine/core";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import FormWithDisable from "@/routes/-components/FormWithDisable";
import RoleSelect from "./-components/RoleSelect";

export const Route = createFileRoute("/_dashboard/profile/create")({
  component: CreateProfileForm,
});

export default function CreateProfileForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      kitchenRate: "",
      drivingRate: "",
      role: "employee",
    },
    validate: {
      firstName: isNotEmpty("First name is required"),
      lastName: isNotEmpty("Last name is required"),
      email: isEmail("Invalid email format"),
    },
    validateInputOnBlur: true,
  });

  const navigate = useNavigate();
  const handleSubmit = async (values: typeof form.values) => {
    const newUserInfo: NewUserInfo = {
      email: values.email,
      role: values.role,
      profileData: {
        first_name: values.firstName,
        last_name: values.lastName,
        role: values.role,
        email: values.email,
        kitchen_rate: parseFloat(values.kitchenRate) || null,
        driving_rate: parseFloat(values.drivingRate) || null,
      },
    };

    try {
      const user = await createUser(newUserInfo);
      console.log("user:", user);

      notifications.show({
        withCloseButton: true,
        color: "green",
        title: "Profile Created!",
        message: "The new profile has password 'rpmp-password'",
      });

      await navigate({
        to: "/profile/search",
        search: (prev) => ({
          ...prev,
          query: user.email || "",
        }),
      });
    } catch (error) {
      notifications.show({
        withCloseButton: true,
        color: "red",
        title: "Profile creation failed",
        message: `${error}`,
      });
    }
  };

  return (
    <FormWithDisable
      submitButtonLabels={{
        label: "Create Profile",
        disabledLabel: "Creating Profile...",
      }}
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="First Name"
            name="firstName"
            required
            key={form.key("firstName")}
            {...form.getInputProps("firstName")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Last Name"
            name="lastName"
            required
            key={form.key("lastName")}
            {...form.getInputProps("lastName")}
          />
        </Grid.Col>
        <Grid.Col>
          <TextInput
            label="Email"
            name="email"
            required
            autoComplete="email"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
        </Grid.Col>
        <Grid.Col>
          <RoleSelect form={form} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Kitchen Rate"
            name="kitchenRate"
            placeholder="$0.00"
            min={0}
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            key={form.key("kitchenRate")}
            {...form.getInputProps("kitchenRate")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Driving Rate"
            name="drivingRate"
            placeholder="$0.00"
            min={0}
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            key={form.key("drivingRate")}
            {...form.getInputProps("drivingRate")}
          />
        </Grid.Col>
      </Grid>
    </FormWithDisable>
  );
}
