import express from "express";
import SettingsController from "@controllers/SettingsController";
import auth from "@middlewares/auth";

const settingsRouter = express.Router();

settingsRouter.get("/", auth.isLoggedIn, auth.isAdmin, SettingsController.getSettingsConfig);
settingsRouter.post("/sync-mods", auth.isLoggedIn, auth.isAdmin, SettingsController.syncMods);

export default settingsRouter;
