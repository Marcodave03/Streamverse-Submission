import express from "express";
import AccountController from "../controller/AccountController.js";

const router = express.Router();

// Profile Routes
router.post("/create-account", AccountController.loginOrRegister);
router.post("/logout", AccountController.logout);
router.get("/balance", AccountController.showUserBalance);
router.patch("/update-profile", AccountController.updateProfile);
router.get("/account-info", AccountController.getAccount);
// router.get("/name", AccountController.showUserName);

export default router;
