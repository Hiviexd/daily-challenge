import { Request, Response } from "express";
import axios from "axios";
import { loadJson } from "@utils/config";
import Settings from "@models/settingsModel";
import { IModsExternalApiResponse, type SettingsMods } from "@interfaces/Settings";

import { IConfig } from "@interfaces/Config";
const config = loadJson<IConfig>("../config.json");

const BLACKLISTED_MODS = ["RD", "AT", "CN", "TD", "SV2", "1K", "2K", "3K", "4K", "5K", "6K", "7K", "8K", "9K", "10K"];

class SettingsController {
    /** Get the settings config */
    public async getSettingsConfig(_: Request, res: Response) {
        const settings = await Settings.getSettingsConfig();
        res.json(settings);
    }

    /** Sync osu! mods */
    public async syncMods(_: Request, res: Response) {
        try {
            const response = await axios.get<IModsExternalApiResponse[]>(config.modsSource);
            const modsApiResponse = response.data;

            const settingsMods: SettingsMods = {
                osu: [],
                taiko: [],
                fruits: [],
                mania: [],
            };

            for (const ruleset of modsApiResponse) {
                // iterate over the rulesets to form a strings array of the mods
                const mods = ruleset.Mods.map((m) => m.Acronym).filter((m) => !BLACKLISTED_MODS.includes(m));
                settingsMods[ruleset.Name] = mods;
            }

            const settings = await Settings.getSettingsConfig();

            settings.mods = settingsMods;
            await settings.save();

            res.json({ message: "Mods synced successfully!" });
        } catch (error) {
            return res.status(500).json({ error: "Error fetching mods from GitHub" });
        }
    }
}

export default new SettingsController();
