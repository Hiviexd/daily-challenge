import { OsuGameMode } from "@interfaces/OsuApi";
import { IDefaultSettingsFile, ModDefaultSettings, ModSettingSpec, ModSettingValue, SettingsMods } from "@interfaces/Settings";
import {
    IBeatmapSlotMods,
    IExternalModRaw,
    IModDefinition,
    IModSettingDefinition,
    IModsExternalApiResponse,
    ISelectedMod,
    ModType,
    ModsCatalog,
} from "@interfaces/Mod";

export const BLACKLISTED_MODS = ["RD", "AT", "CN", "TD", "SV2", "1K", "2K", "3K", "4K", "5K", "6K", "7K", "8K", "9K", "10K"];

export const OSU_GAME_MODES: OsuGameMode[] = ["osu", "taiko", "fruits", "mania"];

export function normalizeOsuGameMode(mode: string | undefined | null): OsuGameMode | undefined {
    if (!mode) return undefined;
    if (mode === "catch") return "fruits";
    return OSU_GAME_MODES.includes(mode as OsuGameMode) ? (mode as OsuGameMode) : undefined;
}

export function resolveBeatmapSlotRuleset(
    slotMods: IBeatmapSlotMods | null | undefined,
    beatmapMode?: OsuGameMode | null
): OsuGameMode {
    if (slotMods?.selected.length) {
        return slotMods.ruleset;
    }
    return beatmapMode ?? slotMods?.ruleset ?? "osu";
}

export function buildAddBeatmapCommand(
    beatmapId: string | number,
    ruleset: OsuGameMode,
    slotMods: IBeatmapSlotMods | null | undefined,
    globalMods?: SettingsMods
): string {
    const selectedPart = slotMods?.selected.length
        ? slotMods.selected.map((mod) => mod.acronym).join(",")
        : "none";
    const globalPart = globalMods?.[ruleset]?.join(",") ?? "";
    return `add ${beatmapId} ${ruleset} ${selectedPart} ${globalPart}`;
}

export const MOD_TYPES: ModType[] = [
    "DifficultyReduction",
    "DifficultyIncrease",
    "Automation",
    "Conversion",
    "Fun",
];

export const MOD_TYPE_LABELS: Record<ModType, string> = {
    DifficultyReduction: "Difficulty Reduction",
    DifficultyIncrease: "Difficulty Increase",
    Automation: "Automation",
    Conversion: "Conversion",
    Fun: "Fun",
};

export const MOD_TYPE_COLORS: Record<ModType, string> = {
    DifficultyReduction: "success",
    DifficultyIncrease: "danger",
    Automation: "info",
    Conversion: "primary",
    Fun: "pink",
};

const VALID_MOD_TYPES = new Set<string>(MOD_TYPES);

function transformSetting(raw: IExternalModRaw["Settings"][number]): IModSettingDefinition {
    const type = raw.Type === "number" || raw.Type === "boolean" || raw.Type === "string" ? raw.Type : "string";
    return {
        name: raw.Name,
        type,
        label: raw.Label,
        description: raw.Description,
    };
}

export function transformExternalMod(raw: IExternalModRaw): IModDefinition | null {
    if (BLACKLISTED_MODS.includes(raw.Acronym)) return null;
    if (raw.Type === "System") return null;
    if (!VALID_MOD_TYPES.has(raw.Type)) return null;

    return {
        acronym: raw.Acronym,
        name: raw.Name,
        description: raw.Description,
        type: raw.Type as ModType,
        settings: raw.Settings.map(transformSetting),
        incompatibleMods: raw.IncompatibleMods,
        requiresConfiguration: raw.RequiresConfiguration,
    };
}

export function buildModsCatalog(apiResponse: IModsExternalApiResponse[]): ModsCatalog {
    const catalog: ModsCatalog = {
        osu: [],
        taiko: [],
        fruits: [],
        mania: [],
    };

    for (const ruleset of apiResponse) {
        if (!OSU_GAME_MODES.includes(ruleset.Name)) continue;
        catalog[ruleset.Name] = ruleset.Mods.map(transformExternalMod).filter((mod): mod is IModDefinition => mod !== null);
    }

    return catalog;
}

export function enrichModSettingWithSpec(
    setting: IModSettingDefinition,
    spec: ModSettingSpec | undefined
): IModSettingDefinition {
    if (!spec) return setting;

    return {
        ...setting,
        ...("default" in spec ? { default: spec.default ?? null } : {}),
        min: spec.min,
        max: spec.max,
        precision: spec.precision,
        options: spec.options?.length ? spec.options : undefined,
        nullable: setting.type === "number" && !("default" in spec),
    };
}

export function enrichCatalogWithDefaultSettings(
    catalog: ModsCatalog,
    defaultSettings: ModDefaultSettings
): ModsCatalog {
    const enriched: ModsCatalog = { osu: [], taiko: [], fruits: [], mania: [] };

    for (const ruleset of OSU_GAME_MODES) {
        enriched[ruleset] = catalog[ruleset].map((mod) => ({
            ...mod,
            settings: mod.settings.map((setting) =>
                enrichModSettingWithSpec(
                    setting,
                    getModSettingSpec(defaultSettings, ruleset, mod.acronym, setting.name)
                )
            ),
        }));
    }

    return enriched;
}

export function createEmptyModDefaultSettings(): ModDefaultSettings {
    return { osu: {}, taiko: {}, fruits: {}, mania: {} };
}

function normalizeModSettingSpec(raw: ModSettingSpec | ModSettingValue): ModSettingSpec {
    if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
        return raw;
    }
    return { default: raw as ModSettingValue };
}

export function getModSettingSpec(
    defaultSettings: ModDefaultSettings | undefined,
    ruleset: OsuGameMode,
    acronym: string,
    settingName: string
): ModSettingSpec | undefined {
    const raw = defaultSettings?.[ruleset]?.[acronym]?.[settingName] as ModSettingSpec | ModSettingValue | undefined;
    if (raw === undefined) return undefined;
    return normalizeModSettingSpec(raw);
}

export function modSettingAllowsNull(setting: IModSettingDefinition): boolean {
    return setting.type === "number" && !!setting.nullable;
}

export function parseDefaultSettingsFile(raw: IDefaultSettingsFile): ModDefaultSettings {
    const result = createEmptyModDefaultSettings();

    for (const ruleset of OSU_GAME_MODES) {
        const rulesetMods = raw.rulesets?.[ruleset] ?? {};
        for (const [acronym, settings] of Object.entries(rulesetMods)) {
            if (BLACKLISTED_MODS.includes(acronym)) continue;
            result[ruleset][acronym] = settings;
        }
    }

    return result;
}

export function resolveModDefaultSettingValue(
    defaultSettings: ModDefaultSettings | undefined,
    ruleset: OsuGameMode,
    acronym: string,
    setting: IModSettingDefinition
): ModSettingValue {
    if (setting.default !== undefined) return setting.default;
    if (setting.nullable) return null;

    const spec = getModSettingSpec(defaultSettings, ruleset, acronym, setting.name);
    if (spec) {
        if ("default" in spec) return spec.default ?? null;
        return null;
    }

    if (setting.type === "boolean") return false;
    if (setting.type === "number") return 0;
    if (setting.options?.length) return setting.options[0];
    return "";
}

export function getModSettingsFormDefaults(
    modDef: IModDefinition,
    ruleset: OsuGameMode,
    defaultSettings: ModDefaultSettings | undefined,
    initialSettings?: Record<string, ModSettingValue>
): Record<string, ModSettingValue> {
    const values: Record<string, ModSettingValue> = {};

    for (const setting of modDef.settings) {
        if (initialSettings && setting.name in initialSettings) {
            values[setting.name] = initialSettings[setting.name];
        } else {
            values[setting.name] = resolveModDefaultSettingValue(defaultSettings, ruleset, modDef.acronym, setting);
        }
    }

    return values;
}

function modSettingValuesEqual(a: ModSettingValue | undefined, b: ModSettingValue | undefined): boolean {
    if (a === b) return true;
    if ((a === null || a === undefined) && (b === null || b === undefined)) return true;
    return false;
}

export function getDefaultBeatmapSlotMods(ruleset: OsuGameMode = "osu"): IBeatmapSlotMods {
    return { ruleset, selected: [] };
}

export function formatSelectedMods(mods?: IBeatmapSlotMods | null): string {
    if (!mods?.selected.length) return "";
    return mods.selected.map((mod) => mod.acronym).join(", ");
}

export function getDisabledModAcronyms(selected: ISelectedMod[], catalog: IModDefinition[]): Set<string> {
    const selectedAcronyms = new Set(selected.map((mod) => mod.acronym));
    const disabled = new Set<string>();

    for (const sel of selected) {
        const modDef = catalog.find((mod) => mod.acronym === sel.acronym);
        if (!modDef) continue;
        for (const incompatible of modDef.incompatibleMods) {
            if (!selectedAcronyms.has(incompatible)) {
                disabled.add(incompatible);
            }
        }
    }

    for (const mod of catalog) {
        if (selectedAcronyms.has(mod.acronym)) continue;
        for (const sel of selected) {
            if (mod.incompatibleMods.includes(sel.acronym)) {
                disabled.add(mod.acronym);
                break;
            }
        }
    }

    return disabled;
}

function validateSettings(
    modDef: IModDefinition,
    settings: Record<string, ModSettingValue> | undefined,
    defaultSettings: ModDefaultSettings | undefined,
    ruleset: OsuGameMode
): string | null {
    if (!modDef.settings.length) return null;

    const values = settings ?? {};
    const allowedNames = new Set(modDef.settings.map((setting) => setting.name));

    for (const key of Object.keys(values)) {
        if (!allowedNames.has(key)) {
            return `Mod ${modDef.acronym} has unknown setting "${key}"`;
        }
    }

    for (const settingDef of modDef.settings) {
        const value = values[settingDef.name];
        if (value === undefined || value === null) continue;

        if (settingDef.type === "number" && typeof value !== "number") {
            return `Setting "${settingDef.label}" on ${modDef.acronym} must be a number`;
        }
        if (settingDef.type === "boolean" && typeof value !== "boolean") {
            return `Setting "${settingDef.label}" on ${modDef.acronym} must be a boolean`;
        }
        if (settingDef.type === "string" && typeof value !== "string") {
            return `Setting "${settingDef.label}" on ${modDef.acronym} must be a string`;
        }

        const min = settingDef.min ?? getModSettingSpec(defaultSettings, ruleset, modDef.acronym, settingDef.name)?.min;
        const max = settingDef.max ?? getModSettingSpec(defaultSettings, ruleset, modDef.acronym, settingDef.name)?.max;
        const options =
            settingDef.options ??
            getModSettingSpec(defaultSettings, ruleset, modDef.acronym, settingDef.name)?.options;

        if (typeof value === "number") {
            if (min !== undefined && value < min) {
                return `Setting "${settingDef.label}" on ${modDef.acronym} must be at least ${min}`;
            }
            if (max !== undefined && value > max) {
                return `Setting "${settingDef.label}" on ${modDef.acronym} must be at most ${max}`;
            }
        }

        if (typeof value === "string" && options?.length && !options.includes(value)) {
            return `Setting "${settingDef.label}" on ${modDef.acronym} must be one of: ${options.join(", ")}`;
        }
    }

    return null;
}

export function validateModSelection(
    mods: IBeatmapSlotMods,
    catalog: ModsCatalog,
    defaultSettings?: ModDefaultSettings
): string | null {
    if (!OSU_GAME_MODES.includes(mods.ruleset)) {
        return "Invalid ruleset";
    }

    const rulesetCatalog = catalog[mods.ruleset];
    if (!rulesetCatalog) {
        return "Mod catalog not found for ruleset";
    }

    const catalogByAcronym = new Map(rulesetCatalog.map((mod) => [mod.acronym, mod]));
    const selectedAcronyms = mods.selected.map((mod) => mod.acronym);

    if (new Set(selectedAcronyms).size !== selectedAcronyms.length) {
        return "Duplicate mods in selection";
    }

    for (const sel of mods.selected) {
        const modDef = catalogByAcronym.get(sel.acronym);
        if (!modDef) {
            return `Mod "${sel.acronym}" is not allowed for ${mods.ruleset}`;
        }

        const settingsError = validateSettings(modDef, sel.settings, defaultSettings, mods.ruleset);
        if (settingsError) return settingsError;

        if (modDef.requiresConfiguration && modDef.settings.length > 0 && !sel.settings) {
            return `Mod "${modDef.name}" requires configuration`;
        }
    }

    for (let i = 0; i < mods.selected.length; i++) {
        for (let j = i + 1; j < mods.selected.length; j++) {
            const modA = catalogByAcronym.get(mods.selected[i].acronym);
            const modB = catalogByAcronym.get(mods.selected[j].acronym);
            if (!modA || !modB) continue;

            if (
                modA.incompatibleMods.includes(modB.acronym) ||
                modB.incompatibleMods.includes(modA.acronym)
            ) {
                return `Mods "${modA.acronym}" and "${modB.acronym}" are incompatible`;
            }
        }
    }

    return null;
}

export function getModDefinition(catalog: ModsCatalog, ruleset: OsuGameMode, acronym: string): IModDefinition | undefined {
    return catalog[ruleset]?.find((mod) => mod.acronym === acronym);
}

export function modHasSettings(mod: IModDefinition): boolean {
    return mod.settings.length > 0 || mod.requiresConfiguration;
}

export function getDecimalPlacesFromPrecision(precision?: number): number | undefined {
    if (precision === undefined) return undefined;
    if (Number.isInteger(precision)) return 0;
    return Math.max(0, Math.ceil(-Math.log10(precision) - 1e-10));
}

export function formatModSettingNumber(value: number, precision?: number): string {
    const decimals = getDecimalPlacesFromPrecision(precision);
    if (decimals === undefined) {
        return Number(value.toPrecision(12)).toString();
    }
    return Number(value.toFixed(decimals)).toString();
}

export function formatModSettingValue(value: ModSettingValue | undefined, precision?: number): string {
    if (value === null || value === undefined) return "Default";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return formatModSettingNumber(value, precision);
    return String(value);
}

export function getModSettingsLines(
    modDef: IModDefinition,
    ruleset: OsuGameMode,
    defaultSettings: ModDefaultSettings | undefined,
    settings?: Record<string, ModSettingValue>
): { label: string; value: string }[] {
    if (!modDef.settings.length) return [];

    return modDef.settings.map((setting) => {
        const rawValue =
            settings && setting.name in settings
                ? settings[setting.name]
                : resolveModDefaultSettingValue(defaultSettings, ruleset, modDef.acronym, setting);

        return {
            label: setting.label,
            value: formatModSettingValue(rawValue, setting.precision),
        };
    });
}

export function getModBadgeColor(modDef?: IModDefinition): string {
    if (!modDef) return "primary";
    return MOD_TYPE_COLORS[modDef.type];
}

export function hasCustomModSettings(
    modDef: IModDefinition,
    ruleset: OsuGameMode,
    defaultSettings: ModDefaultSettings | undefined,
    settings?: Record<string, ModSettingValue>
): boolean {
    if (!settings || !modDef.settings.length) return false;

    for (const setting of modDef.settings) {
        const value = settings[setting.name];
        if (value === undefined) continue;

        const defaultValue = resolveModDefaultSettingValue(defaultSettings, ruleset, modDef.acronym, setting);
        if (!modSettingValuesEqual(value, defaultValue)) return true;
    }

    return false;
}
