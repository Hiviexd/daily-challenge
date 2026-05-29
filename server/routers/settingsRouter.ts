import express from "express";
import SettingsController from "@controllers/SettingsController";
import auth from "@middlewares/auth";

const settingsRouter = express.Router();

settingsRouter.get("/", auth.isLoggedIn, auth.isStaff, SettingsController.getSettingsConfig);
settingsRouter.get("/mods", SettingsController.getModsCatalog);
settingsRouter.get("/modsInfo", auth.isLoggedIn, auth.isAdmin, SettingsController.getModsInfo);

export default settingsRouter;
