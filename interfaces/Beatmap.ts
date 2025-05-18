import { Document } from "mongoose";
import { IUser } from "./User";

export interface IBeatmap extends Document {
    beatmapId: number;
    beatmapsetId: number;
    artist: string;
    title: string;
    version: string;
    cover: string; // cover@2x
    rankedDate: Date;
    creator: {
        osuId: number;
        username: string;
    };
    suggestedBy?: IUser;
    suggestedMods?: string[];
    notes?: string;
}
