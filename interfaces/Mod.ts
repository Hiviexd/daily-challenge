import { OsuGameMode } from "./OsuApi";
import { ModSettingValue, ModDefaultSettings } from "./Settings";

export type ModType =
    | "DifficultyReduction"
    | "DifficultyIncrease"
    | "Automation"
    | "Conversion"
    | "Fun";

export interface IModSettingDefinition {
    name: string;
    type: "number" | "boolean" | "string";
    label: string;
    description: string;
    default?: ModSettingValue;
    min?: number;
    max?: number;
    precision?: number;
    options?: string[];
    nullable?: boolean;
}

export interface IModDefinition {
    acronym: string;
    name: string;
    description: string;
    type: ModType;
    settings: IModSettingDefinition[];
    incompatibleMods: string[];
    requiresConfiguration: boolean;
}

export type ModsCatalog = Record<OsuGameMode, IModDefinition[]>;

export interface IModsCatalogResponse {
    catalog: ModsCatalog;
    defaultSettings: ModDefaultSettings;
}

export interface ISelectedMod {
    acronym: string;
    settings?: Record<string, ModSettingValue>;
}

export interface IBeatmapSlotMods {
    ruleset: OsuGameMode;
    selected: ISelectedMod[];
}

export interface IExternalModRaw {
    Acronym: string;
    Name: string;
    Description: string;
    Type: string;
    Settings: {
        Name: string;
        Type: string;
        Label: string;
        Description: string;
    }[];
    IncompatibleMods: string[];
    RequiresConfiguration: boolean;
    UserPlayable: boolean;
}

export interface IModsExternalApiResponse {
    Name: OsuGameMode;
    RulesetID: number;
    Mods: IExternalModRaw[];
}
