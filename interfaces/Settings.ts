import { Document, Model, DocumentQuery } from "mongoose";
import { OsuGameMode } from "./OsuApi";

export type SettingsMods = {
    [key in OsuGameMode]: string[];
};

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
    modsUpdatedAt: Date;
}

export interface ISettingsStatics extends Model<ISettings> {
    getSettingsConfig: () => DocumentQuery<ISettings, ISettings>;
}
