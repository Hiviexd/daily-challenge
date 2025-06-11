import { Request, Response } from "express";
import User from "@models/userModel";
import Round from "@models/roundModel";
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

    /** GET staff stats */
    public async getStaffStats(_: Request, res: Response): Promise<void> {
        const staff = await User.find({ groups: { $in: ["staff"] } })
            .collation({ locale: "en", strength: 2 })
            .sort({ username: 1 });

        const statsPromises = staff.map(async (user) => {
            // Find the most recent round assigned to this user
            const lastRound = await Round.findOne({ assignedUser: user._id }).sort({ startDate: -1 });

            let weeksSinceLastAssignment: number | null = null;
            let lastRoundTitle: string | null = null;

            if (lastRound) {
                lastRoundTitle = lastRound.title;
                const now = new Date();
                const roundStartDate = new Date(lastRound.startDate);
                const diffTime = now.getTime() - roundStartDate.getTime();
                const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                weeksSinceLastAssignment = diffWeeks;
            }

            return {
                user,
                weeksSinceLastAssignment,
                lastRoundTitle,
            };
        });

        const stats = await Promise.all(statsPromises);

        // Sort by weeksSinceLastAssignment (biggest to smallest), with null values at the end
        // Negative values (future assignments) should come after positive values (past assignments)
        stats.sort((a, b) => {
            if (a.weeksSinceLastAssignment === null && b.weeksSinceLastAssignment === null) return 0;
            if (a.weeksSinceLastAssignment === null) return 1;
            if (b.weeksSinceLastAssignment === null) return -1;

            // If one is negative and one is positive, positive comes first
            if (a.weeksSinceLastAssignment! < 0 && b.weeksSinceLastAssignment! >= 0) return 1;
            if (a.weeksSinceLastAssignment! >= 0 && b.weeksSinceLastAssignment! < 0) return -1;

            // Both are same sign, sort normally (biggest to smallest)
            return b.weeksSinceLastAssignment! - a.weeksSinceLastAssignment!;
        });

        res.json(stats);
    }
}

export default new UsersController();
