import mongoose from "mongoose";
import { IRound } from "@interfaces/Round";
import moment from "moment";
import utils from "@utils/index";

const RoundSchema = new mongoose.Schema<IRound>(
    {
        assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        beatmaps: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beatmap" }],
        beatmapOrder: [
            {
                beatmapId: { type: mongoose.Schema.Types.ObjectId, ref: "Beatmap", required: true },
                order: { type: Number, required: true },
            },
        ],
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        theme: { type: String },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

RoundSchema.virtual("isActive").get(function (this: IRound) {
    const today = moment().startOf("day");
    const startDay = moment(this.startDate).startOf("day");
    const endDay = moment(this.endDate).startOf("day");
    return today.isSameOrAfter(startDay) && today.isSameOrBefore(endDay);
});

RoundSchema.virtual("isUpcoming").get(function (this: IRound) {
    const today = moment().startOf("day");
    const startDay = moment(this.startDate).startOf("day");
    return today.isBefore(startDay);
});

RoundSchema.virtual("isPast").get(function (this: IRound) {
    const today = moment().startOf("day");
    const endDay = moment(this.endDate).startOf("day");
    return today.isAfter(endDay);
});

RoundSchema.virtual("title").get(function (this: IRound) {
    return moment(this.startDate).format("MMM D") + " — " + moment(this.endDate).format("MMM D YYYY");
});

RoundSchema.virtual("isMonthHighlight").get(function (this: IRound) {
    // Monthly highlights are only considered for rounds after 2026-01-01
    if (moment(this.startDate).isBefore("2026-01-01")) {
        return false;
    }

    return utils.checkIfFirstWeekOfMonth(this.startDate, this.endDate);
});
const Round = mongoose.model<IRound>("Round", RoundSchema);

export default Round;
