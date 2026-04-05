import {Router} from "express";
const router = Router();

import { createTask,getTask,updateTask,deleteTask,toggleTaskStatus } from "../Controller/taskController.js";
import { authMiddleware } from "../../../middleware/authMiddleware.js";


router.post("/",authMiddleware,createTask);
router.get("/",authMiddleware,getTask);
router.patch("/:id",authMiddleware,updateTask);
router.delete("/:id",authMiddleware,deleteTask);
router.patch("/:id/toggle",authMiddleware,toggleTaskStatus);

export default router;