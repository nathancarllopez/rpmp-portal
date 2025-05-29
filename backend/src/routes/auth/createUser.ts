import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export default async function createUser(
  req: Request,
  res: Response
): Promise<void> {
  const { email, role = "user", profileData = {} } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: "rpmp-password",
    email_confirm: true,
    user_metadata: {
      has_signed_in: false,
      role: role,
    },
  });

  if (createError || !data?.user) {
    console.log("createError");
    console.log(createError?.message);
    res
      .status(500)
      .json({ error: createError?.message || "User creation failed" });
    return;
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    ...profileData,
    user_id: data.user.id,
    kitchen_rate: profileData.kitchen_rate || null,
    driving_rate: profileData.driving_rate || null,
  });

  if (profileError) {
    console.log("profileError");
    console.log(profileError.message);
    res.status(500).json({ error: profileError.message });
    return;
  }

  const { error: avatarError } = await supabase
    .storage
    .from('avatars')
    .copy('image-missing.jpg', `profilePics/${data.user.id}.jpg`);
    
  if (avatarError) {
    console.log('avatarError');
    console.log(avatarError.message);
    res.status(500).json({ error: avatarError.message });
    return;
  }

  res.status(200).json({ user: data.user });
}
