import { loadJson } from "@utils/config";
import { IDefaultSettingsFile } from "@interfaces/Settings";
import { createEmptyModDefaultSettings, parseDefaultSettingsFile } from "@utils/mods";

export function loadDefaultSettingsFromFile() {
    try {
        const raw = loadJson<IDefaultSettingsFile>("../mods/default_settings.json");
        return parseDefaultSettingsFile(raw);
    } catch {
        return createEmptyModDefaultSettings();
    }
}
