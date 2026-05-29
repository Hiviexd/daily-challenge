import { loadJson } from "@utils/config";
import { IDefaultSettingsFile } from "@interfaces/Settings";
import { IModsExternalApiResponse } from "@interfaces/Mod";
import { createEmptyModDefaultSettings, parseDefaultSettingsFile } from "@utils/mods";

export function loadModsFromFile(): IModsExternalApiResponse[] {
    return loadJson<IModsExternalApiResponse[]>("../mods/mods.json");
}

export function loadDefaultSettingsFileRaw(): IDefaultSettingsFile {
    return loadJson<IDefaultSettingsFile>("../mods/default_settings.json");
}

export function loadDefaultSettingsFromFile() {
    try {
        return parseDefaultSettingsFile(loadDefaultSettingsFileRaw());
    } catch {
        return createEmptyModDefaultSettings();
    }
}
