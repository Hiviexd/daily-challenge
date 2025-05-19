import mongoose from "mongoose";
import { IBeatmap } from "@interfaces/Beatmap";

const BeatmapSchema = new mongoose.Schema<IBeatmap>(
    {
        beatmapId: { type: Number, required: true },
        beatmapsetId: { type: Number, required: true },
        artist: { type: String, required: true },
        title: { type: String, required: true },
        version: { type: String, required: true },
        cover: { type: String, required: true },
        rankedDate: { type: Date, required: true },
        creator: {
            osuId: { type: Number, required: true },
            username: { type: String, required: true },
        },
        suggestedMods: { type: [String] },
        suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: { type: String },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Beatmap = mongoose.model<IBeatmap>("Beatmap", BeatmapSchema);

export default Beatmap;
