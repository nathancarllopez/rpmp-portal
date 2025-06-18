// import FormWithDisable from "@/components/misc/FormWithDisable";
// import { PasswordInput, TextInput } from "@mantine/core";
// import { isEmail, useForm } from "@mantine/form";
// import type { Profile } from "@rpmp-portal/types";
// import { getRouteApi } from "@tanstack/react-router";

// interface EditProfileFormProps {
//   profile: Profile;
// }

// export default function EditProfileForm({ profile }: EditProfileFormProps) {
//   const { userId } = getRouteApi("/_authCheck/dashboard/").useRouteContext();

//   if (userId === null) {
//     throw new Error("UserId is null in EditProfileForm");
//   }

//   const form = useForm({
//     mode: "uncontrolled",
//     initialValues: {
//       email: profile.email,
//       kitchenRate: profile.kitchenRate,
//       drivingRate: profile.drivingRate,
//       role: profile.role,
//       newPassword: "",
//     },
//     validate: {
//       email: isEmail("Invalid email format"),
//       newPassword: (value) =>
//         value.length > 0 && value.length < 6
//           ? "Password must be at least 6 characters"
//           : null,
//     },
//     validateInputOnBlur: true,
//   });

//   const handleSubmit = async (values: typeof form.values) => {}

//   return (
//     <FormWithDisable
//       submitButtonLabels={{
//         label: "Update",
//         disabledLabel: "Updating..."
//       }}
//       submitButtonStyle={{}}
//       onSubmit={form.onSubmit(handleSubmit)}
//     >
//       <TextInput
//         label="Email"
//         name="email"
//         autoComplete="email"
//         key={form.key("email")}
//         {...form.getInputProps("email")}
//       />
//       {profile.userId === userId && (
//         <PasswordInput
//           label="New Password"
//           name="newPassword"
//           key={form.key("newPassword")}
//           {...form.getInputProps("newPassword")}
//         />
//       )}

//     </FormWithDisable>
//   );
// }
