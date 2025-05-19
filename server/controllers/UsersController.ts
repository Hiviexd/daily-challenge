import { Request, Response } from "express";
import User from "@models/userModel";

class UsersController {
    /** GET logged in user */
    public getSelf(_: Request, res: Response): void {
        const user = res.locals!.user!;
        res.json(user);
    }

    /** GET staff list */
    public async getStaff(_: Request, res: Response): Promise<void> {
        const users = await User.find({ groups: { $in: ["staff"] } });
        res.json(users);
    }
}

export default new UsersController();
