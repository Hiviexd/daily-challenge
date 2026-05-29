import { Request, Response } from "express";
import Settings from "@models/settingsModel";
import { IModsCatalogResponse } from "@interfaces/Mod";
import { IModsInfo } from "@interfaces/Settings";
import { buildModsCatalog, enrichCatalogWithDefaultSettings } from "@utils/mods";
import { loadDefaultSettingsFileRaw, loadDefaultSettingsFromFile, loadModsFromFile } from "@utils/modsServer";

import { loadJson } from "@utils/config";
import { IConfig } from "@interfaces/Config";
const config = loadJson<IConfig>("../config.json");

const SYNC_MODS_WORKFLOW_FILE = "sync-mods.yml";

class SettingsController {
    public async getSettingsConfig(_: Request, res: Response) {
        const settings = await Settings.getSettingsConfig();
        res.json(settings);
    }

    /** Get filtered mod catalog for mod selector UI */
    public getModsCatalog(_: Request, res: Response) {
        try {
            const modsApiResponse = loadModsFromFile();
            const defaultSettings = loadDefaultSettingsFromFile();
            const catalog = enrichCatalogWithDefaultSettings(buildModsCatalog(modsApiResponse), defaultSettings);

            const response: IModsCatalogResponse = { catalog, defaultSettings };
            res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Error loading mod catalog" });
        }
    }

    /** Read-only metadata about committed mod data files */
    public getModsInfo(_: Request, res: Response) {
        try {
            const raw = loadDefaultSettingsFileRaw();
            const workflowUrl = config.githubRepo
                ? `https://github.com/${config.githubRepo}/actions/workflows/${SYNC_MODS_WORKFLOW_FILE}`
                : undefined;

            const info: IModsInfo = {
                defaultSettingsGeneratedAt: raw.generated_at ?? null,
                modsCatalogSource: "osu-web database/mods.json",
                workflowUrl,
            };

            res.json(info);
        } catch (error) {
            return res.status(500).json({ error: "Error loading mods info" });
        }
    }
}

export default new SettingsController();
