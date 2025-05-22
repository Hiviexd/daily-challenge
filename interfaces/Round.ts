import { Document } from "mongoose";
import { IUser } from "./User";
import { IBeatmap } from "./Beatmap";

export type WarningType = "duplicate_set" | "duplicate_difficulty" | "duplicate_song";

export interface IWarning {
    targetBeatmapId: string;
    type: WarningType;
    duplicates: string[];
}

export interface IRound extends Document {
    assignedUser: IUser;
    beatmaps: IBeatmap[];
    startDate: Date;
    endDate: Date;
    theme?: string;
    beatmapOrder: { beatmapId: string; order: number }[];

    // Virtuals
    isActive: boolean;
    isUpcoming: boolean;
    isPast: boolean;
    title: string;
}
