import express from "express";

const router = express.Router();

import userRoutes from "../controllers/account.js";

router.get("/login", userRoutes.getLogin);
router.post("/login", userRoutes.postLogin);

router.get("/register", userRoutes.getRegister);
router.post("/register", userRoutes.postRegister);

router.get("/logout", userRoutes.getLogout);

router.post("/update-profile", userRoutes.postProfileUpdate);
router.post("/change-password", userRoutes.postUpdatePassword);

export default router;
