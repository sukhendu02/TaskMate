
import { Router } from "express";
const router = Router();


import  { userRegistration,userLogin,userLogout } from '../Controller/authController.js';
import { authMiddleware } from "../../../middleware/authMiddleware.js";

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.post("/logout",authMiddleware,userLogout);

export default router;