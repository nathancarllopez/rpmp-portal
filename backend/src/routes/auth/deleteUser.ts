import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export default async function deleteUser(
  req: Request,
  res: Response
): Promise<void> {
  const { idToDelete } = req.body;

  if (!idToDelete) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(
    idToDelete
  );

  if (deleteError) {
    console.log("deleteError");
    console.log(deleteError.message);
    res.status(500).json({ error: deleteError.message });
    return;
  }

  res.status(200).json({ idToDelete });
}
