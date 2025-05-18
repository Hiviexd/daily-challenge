import { Document, Model, DocumentQuery } from "mongoose";

export type UserGroup = "user" | "staff" | "spectator" | "admin";

export interface IUser extends Document {
    osuId: number;
    username: string;
    groups: UserGroup[];

    // virtuals
    avatarUrl: string;
    osuProfileUrl: string;
    hasAccess: boolean;
    isStaff: boolean;
    isSpectator: boolean;
    isAdmin: boolean;
}

export interface IUserStatics extends Model<IUser> {
    findByUsernameOrOsuId: (user: string | number) => DocumentQuery<IUser, IUser>;
}
