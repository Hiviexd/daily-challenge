import { Request, Response } from "express";
import axios from "axios";
import { loadJson } from "@utils/config";
import Settings from "@models/settingsModel";
import { IModsExternalApiResponse, type SettingsMods } from "@interfaces/Settings";
import { IModsCatalogResponse, IModsExternalApiResponse as IModsCatalogSource } from "@interfaces/Mod";
import LogService from "@services/LogService";
import { BLACKLISTED_MODS, buildModsCatalog, enrichCatalogWithDefaultSettings } from "@utils/mods";
import { loadDefaultSettingsFromFile } from "@utils/modsServer";

import { IConfig } from "@interfaces/Config";
const config = loadJson<IConfig>("../config.json");

class SettingsController {
    public async getSettingsConfig(_: Request, res: Response) {
        const settings = await Settings.getSettingsConfig();
        res.json(settings);
    }

    /** Get filtered mod catalog for mod selector UI */
    public getModsCatalog(_: Request, res: Response) {
        try {
            const modsApiResponse = loadJson<IModsCatalogSource[]>("../mods.json");
            const defaultSettings = loadDefaultSettingsFromFile();
            const catalog = enrichCatalogWithDefaultSettings(buildModsCatalog(modsApiResponse), defaultSettings);

            const response: IModsCatalogResponse = { catalog, defaultSettings };
            res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Error loading mod catalog" });
        }
    }

    /** Sync osu! mods */
    public async syncMods(_: Request, res: Response) {
        try {
            const loggedInUser = res.locals!.user!;

            const response = await axios.get<IModsExternalApiResponse[]>(config.modsSource);
            const modsApiResponse = response.data;

            const settingsMods: SettingsMods = {
                osu: [],
                taiko: [],
                fruits: [],
                mania: [],
            };

            for (const ruleset of modsApiResponse) {
                const mods = ruleset.Mods.map((m) => m.Acronym).filter((m) => !BLACKLISTED_MODS.includes(m));
                settingsMods[ruleset.Name] = mods;
            }

            const modDefaultSettings = loadDefaultSettingsFromFile();

            const settings = await Settings.getSettingsConfig();

            settings.mods = settingsMods;
            settings.modDefaultSettings = modDefaultSettings;
            settings.modsUpdatedAt = new Date();
            await settings.save();

            res.json({ message: "Mods synced successfully!" });

            LogService.generate(loggedInUser._id, `Synced osu! mods`);
        } catch (error) {
            return res.status(500).json({ error: "Error fetching mods from GitHub" });
        }
    }
}

export default new SettingsController();
