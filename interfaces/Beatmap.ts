import { Document } from "mongoose";

export interface IBeatmap extends Document {
    beatmapId: number;
    beatmapsetId: number;
    starRating: number;
    artist: string;
    title: string;
    version: string;
    cover: string; // cover@2x
    rankedDate: Date;
    creator: {
        osuId: number;
        username: string;
    };
    notes?: string;
}
