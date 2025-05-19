import { Request, Response } from "express";
import Round from "@models/roundModel";
import LogService from "@services/LogService";
import User from "@models/userModel";

const DEFAULT_POPULATE = [{ path: "assignedUser", select: "username osuId groups" }];
const DEFAULT_LIMIT = 10;

const selectFields = (hasAccess: boolean) => {
    return hasAccess ? "" : "-assignedUser";
};

class RoundController {
    /** GET all rounds */
    public async index(req: Request, res: Response) {
        const loggedInUser = res.locals!.user;
        const isStaff = !!(loggedInUser && loggedInUser.isStaff);

        const cursor = req.query.cursor as string | undefined;

        const query: any = isStaff ? {} : { isPublished: true };
        if (cursor) {
            query.startDate = { $lt: new Date(cursor) };
        }

        const rounds = await Round.find(query)
            .select(selectFields(isStaff))
            .populate(DEFAULT_POPULATE)
            .sort({ startDate: -1 })
            .limit(DEFAULT_LIMIT);

        const nextCursor = rounds.length === DEFAULT_LIMIT ? rounds[rounds.length - 1].startDate.toISOString() : null;

        res.status(200).json({ rounds, nextCursor });
    }

    /* POST create round */
    public async create(req: Request, res: Response) {
        const { startDate, theme, assignedUserId } = req.body;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const loggedInUser = res.locals!.user!;

        const rounds = await Round.find({});

        // check if the date range is already taken
        const isDateRangeTaken = rounds.some((round) => {
            const roundStart = new Date(round.startDate).getTime();
            const roundEnd = new Date(round.endDate).getTime();
            const newStart = new Date(startDate).getTime();
            const newEnd = new Date(endDate).getTime();
            return roundStart <= newEnd && roundEnd >= newStart;
        });

        if (isDateRangeTaken) {
            return res.status(400).json({ message: "Date range is already taken" });
        }

        const assignedUser = await User.findById(assignedUserId);

        if (!assignedUser) {
            return res.status(400).json({ message: "Assigned user not found" });
        }

        const round = new Round({
            assignedUser,
            beatmaps: [],
            startDate,
            endDate,
            theme,
            isPublished: false,
        });

        await round.save();

        res.status(201).json({ message: "Round created successfully!", round });

        // logging
        LogService.generate(loggedInUser._id, `Created round: ${round.title}`);
    }
}

export default new RoundController();
