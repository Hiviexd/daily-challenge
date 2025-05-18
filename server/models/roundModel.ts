import mongoose, { Schema } from "mongoose";
import { IRound } from "../../interfaces/Round";
import moment from "moment";

const RoundSchema = new Schema<IRound>(
    {
        assignedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
        beatmaps: [{ type: Schema.Types.ObjectId, ref: "Beatmap", required: true }],
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        theme: { type: String },
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

RoundSchema.virtual("isActive").get(function(this: IRound) {
    return this.startDate <= new Date() && this.endDate >= new Date();
});

RoundSchema.virtual("isUpcoming").get(function(this: IRound) {
    return this.startDate > new Date();
});

RoundSchema.virtual("isPast").get(function(this: IRound) {
    return this.endDate < new Date();
});

RoundSchema.virtual("title").get(function(this: IRound) {
    return moment(this.startDate).format("MMM D") + " — " + moment(this.endDate).format("MMM D YYYY");
});

const Round = mongoose.model<IRound>("Round", RoundSchema);

export default Round;
