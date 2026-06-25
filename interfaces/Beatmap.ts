import { Document } from "mongoose";
import { OsuGameMode } from "./OsuApi";

export interface IBeatmap extends Document {
    beatmapId: number;
    beatmapsetId: number;
    starRating: number;
    mode?: OsuGameMode;
    artist: string;
    title: string;
    version: string;
    cover: string; // slimcover@2x
    rankedDate: Date;
    creator: {
        osuId: number;
        username: string;
    };
    notes?: string;
}
