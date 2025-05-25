import express, { Request, Response } from 'express';
import { supabase } from '../supabase/client';
// import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// router.post('/create-user', requireAdmin, async (req: Request, res: Response): Promise<void> => {
router.post('/create-user', async (req: Request, res: Response): Promise<void> => {
  const { email, role = "user", profileData = {} } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: "rpmp-password",
    email_confirm: true,
    user_metadata: {
      has_signed_in: false,
      role: role
    }
  });

  if (createError || !data?.user) {
    console.log('createError')
    console.log(createError?.message)
    res.status(500).json({ error: createError?.message || "User creation failed" });
    return;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ 
      ...profileData,
      'user_id': data.user.id, 
      'kitchen_rate': profileData.kitchen_rate || null,
      'driving_rate': profileData.driving_rate || null,
    });

  if (profileError) {
    console.log('profileError')
    console.log(profileError.message)
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ user: data.user });
});

router.post('/delete-user', async (req: Request, res: Response): Promise<void> => {
  const { idToDelete } = req.body;
  
  if (!idToDelete) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(idToDelete);

  if (deleteError) {
    console.log("deleteError");
    console.log(deleteError.message)
    res.status(500).json({ error: deleteError.message })
    return;
  }

  res.status(200).json({ idToDelete });
})

export default router;
