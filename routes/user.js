import express from "express";

const router = express.Router();

import userRoutes from "../controllers/user.js";

router.get("/", userRoutes.getIndex);

router.get("/add-task", userRoutes.getAddTask);
router.post("/add-task", userRoutes.postAddTask);

router.get("/edit-task/:taskId", userRoutes.getEditTask);
router.post("/edit-task", userRoutes.postEditTask);

router.get("/confirmed-tasks", userRoutes.getConfirmedTasks);
router.post("/confirm-task", userRoutes.postConfirmTask);

router.post("/delete-task/:taskId", userRoutes.postDeleteTask);

router.get("/profile", userRoutes.getProfile);
router.get("/profile-update", userRoutes.getProfileUpdate);
router.get("/security-settings", userRoutes.getSecuritySettings);

export default router;
