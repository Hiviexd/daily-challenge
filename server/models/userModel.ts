import mongoose from "mongoose";
import { IUser, IUserStatics } from "@interfaces/User";
import utils from "@utils/index";

const UserSchema = new mongoose.Schema<IUser, IUserStatics>(
    {
        osuId: { type: Number, required: true, unique: true },
        username: { type: String, required: true },
        groups: { type: [String], default: ["user"] },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual("avatarUrl").get(function (this: IUser) {
    return `https://a.ppy.sh/${this.osuId}`;
});

UserSchema.virtual("osuProfileUrl").get(function (this: IUser) {
    return `https://osu.ppy.sh/users/${this.osuId}`;
});

UserSchema.virtual("isStaff").get(function (this: IUser) {
    return this.groups.includes("staff");
});

UserSchema.virtual("isSpectator").get(function (this: IUser) {
    return this.groups.includes("spectator");
});

UserSchema.virtual("isAdmin").get(function (this: IUser) {
    return this.groups.includes("admin");
});

UserSchema.virtual("hasAccess").get(function (this: IUser) {
    return this.isStaff || this.isSpectator || this.isAdmin;
});


UserSchema.statics.findByUsernameOrOsuId = async function (this: IUserStatics, user: string | number) {
    // Attempt username lookup first
    const usernameResult = await this.findOne({
        username: new RegExp("^" + utils.escapeUsername(user as string) + "$", "i"),
    });
    if (usernameResult) return usernameResult;

    // If not found, try osuId lookup
    const osuId = parseInt(user as string, 10);
    if (!isNaN(osuId)) {
        return this.findOne({ osuId });
    }
    return null;
};

const User = mongoose.model<IUser, IUserStatics>("User", UserSchema);

export default User;
