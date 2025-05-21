import { Request, Response } from "express";
import User from "@models/userModel";
import UserService from "@services/UserService";
import { type UserGroup, type UserGroupAction } from "@interfaces/User";

class UsersController {
    /** GET logged in user */
    public getSelf(_: Request, res: Response): void {
        const user = res.locals!.user!;
        res.json(user);
    }

    /** GET staff list */
    public async getStaff(_: Request, res: Response): Promise<void> {
        const users = await User.find({ groups: { $in: ["staff"] } })
            .collation({ locale: "en", strength: 2 })
            .sort({ username: 1 });
        res.json(users);
    }

    public async getSpectators(_: Request, res: Response): Promise<void> {
        const users = await User.find({ groups: { $in: ["spectator"] } })
            .collation({ locale: "en", strength: 2 })
            .sort({ username: 1 });
        res.json(users);
    }

    /** GET user */
    public async findOrCreateUser(req: Request, res: Response) {
        const { userInput } = req.params;

        const user = await UserService.findOrCreateUser(req.session.accessToken!, userInput);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    }

    /** PATCH handle group move */
    public async handleGroupMove(req: Request, res: Response) {
        const { userInput } = req.params;
        const { action, group } = req.body as { action: UserGroupAction; group: UserGroup };

        const user = await User.findByUsernameOrOsuId(userInput);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // general premise is, if the user is not in the group, add them to the group, else skip
        if (action === "add" && !user.groups.includes(group)) {
            user.groups.push(group);
        } else if (action === "remove" && user.groups.includes(group)) {
            user.groups = user.groups.filter((g) => g !== group);
        }

        await user.save();

        res.json({ message: "Group move handled successfully!" });
    }
}

export default new UsersController();
