import { Document, Model, DocumentQuery } from "mongoose";
import { OsuGameMode } from "./OsuApi";

export type SettingsMods = {
    [key in OsuGameMode]: string[];
};

export type ModSettingValue = number | boolean | string | null;

export interface ModSettingSpec {
    default?: ModSettingValue;
    min?: number;
    max?: number;
    precision?: number;
    options?: string[];
}

export type ModDefaultSettings = {
    [key in OsuGameMode]: Record<string, Record<string, ModSettingSpec>>;
};

export interface IDefaultSettingsFile {
    generated_at?: string;
    rulesets: ModDefaultSettings;
}

export interface IExternalMod {
    Acronym: string;
    Name: string;
    Description: string;

    // Other attributes that we don't care about
    [key: string]: any;
}

export interface IModsExternalApiResponse {
    Name: string;
    RulesetID: number;
    Mods: IExternalMod[];
}

export interface ISettings extends Document {
    mods: SettingsMods;
    modDefaultSettings?: ModDefaultSettings;
    modsUpdatedAt: Date;
}

export interface ISettingsStatics extends Model<ISettings> {
    getSettingsConfig: () => DocumentQuery<ISettings, ISettings>;
}
