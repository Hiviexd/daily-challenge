import express from "express";
import SettingsController from "@controllers/SettingsController";
import auth from "@middlewares/auth";

const settingsRouter = express.Router();

settingsRouter.get("/", auth.isLoggedIn, auth.isStaff, SettingsController.getSettingsConfig);
settingsRouter.post("/syncMods", auth.isLoggedIn, auth.isAdmin, SettingsController.syncMods);

export default settingsRouter;
