import { IUser } from "./User";
import { Document } from "mongoose";

export interface ILog extends Document {
    user: IUser;
    action: string;
}
