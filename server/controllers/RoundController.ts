import Round from "../models/roundModel";
import { Request, Response } from "express";

const DEFAULT_POPULATE = [{ path: "assignedUser", select: "username osuId groups" }, { path: "beatmaps" }];

const selectFields = (hasAccess: boolean) => {
    return hasAccess ? "" : "-assignedUser";
};

class RoundController {
    /** GET active round */
    public async getActiveRound(_: Request, res: Response) {
        const activeRound = await Round.findOne({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        }).populate("assignedUser beatmaps");

        res.json(activeRound);
    }

    /** GET all rounds */
    public async getRounds(_: Request, res: Response) {
        const loggedInUser = res.locals!.user!;
        const rounds = await Round.find(loggedInUser.isStaff ? {} : { isPublic: true })
            .select(selectFields(loggedInUser.isStaff))
            .populate(DEFAULT_POPULATE);

        res.json(rounds);
    }

    /* POST update round */
}

export default new RoundController();
