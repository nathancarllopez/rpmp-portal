import express from "express";
import createUser from "./createUser";
import deleteUser from "./deleteUser";
// import { requireAdmin } from "../../middleware/requireAdmin";

const router = express.Router();

// router.post("/create-user", requireAdmin, createUser);
// router.post("/delete-user", requireAdmin, deleteUser);

router.post("/create-user", createUser);
router.post("/delete-user", deleteUser);

export default router;