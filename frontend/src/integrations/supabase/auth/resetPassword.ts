import { supabase } from "../client";

const redirectTo = "http://localhost:3000/changePassword";

export default async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.log("Error requesting password reset:", error.message);
    console.log(error.code);

    throw error;
  }
}
