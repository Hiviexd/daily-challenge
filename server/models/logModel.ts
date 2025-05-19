import mongoose from "mongoose";
import { ILog } from "@interfaces/Log";

const LogSchema = new mongoose.Schema<ILog>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: { type: String, required: true },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Log = mongoose.model<ILog>("Log", LogSchema);

export default Log;
