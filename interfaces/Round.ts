import { Document } from "mongoose";
import { IUser } from "./User";
import { IBeatmap } from "./Beatmap";

export interface IRound extends Document {
    assignedUser: IUser;
    beatmaps: IBeatmap[];
    startDate: Date;
    endDate: Date;
    theme?: string;
    isPublished: boolean;

    // Virtuals
    isActive: boolean;
    isUpcoming: boolean;
    isPast: boolean;
    title: string;
}
