import { Request, Response } from "express";
import Round from "@models/roundModel";
import LogService from "@services/LogService";
import User from "@models/userModel";
import RoundService from "@services/RoundService";
import BeatmapService from "@services/BeatmapService";

const DEFAULT_POPULATE = [{ path: "assignedUser", select: "username osuId groups" }, { path: "beatmaps" }];
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

        let rounds = await Round.find(query)
            .select(selectFields(isStaff))
            .populate(DEFAULT_POPULATE)
            .sort({ startDate: -1 })
            .limit(DEFAULT_LIMIT);

        const nextCursor = rounds.length === DEFAULT_LIMIT ? rounds[rounds.length - 1].startDate.toISOString() : null;

        rounds = RoundService.checkDuplicatesWithCache(rounds, rounds);

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
            beatmapOrder: [],
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

    public async update(req: Request, res: Response) {
        const { roundId } = req.params;
        const { theme, assignedUserId } = req.body;

        const round = await Round.findById(roundId);

        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        round.theme = theme;
        round.assignedUser = assignedUserId;
        await round.save();

        return res.status(200).json({ message: "Round updated successfully!", round });
    }

    public async updateBeatmap(req: Request, res: Response) {
        const { roundId } = req.params;
        const { index, beatmapId, notes } = req.body;

        const round = await Round.findById(roundId).populate(DEFAULT_POPULATE);

        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        // if notes, update the notes only
        if (notes) {
            if (Array.isArray(round.beatmapOrder)) {
                const entry = round.beatmapOrder.find((e: any) => e.order === index);
                if (entry) {
                    const bm = round.beatmaps.find((bm: any) => bm._id.toString() === entry.beatmapId.toString());
                    if (bm) bm.notes = notes;
                }
            }
            await round.save();
            // No need to reconstruct or sort beatmaps for display
            return res.status(200).json({ message: "Beatmap notes updated successfully!", round });
        }

        // if beatmapId, create a new beatmap to replace the one in the index
        if (beatmapId !== undefined && index !== undefined) {
            const beatmap = await BeatmapService.getOrCreateBeatmap(beatmapId, req.session!.accessToken!);

            if (!beatmap) {
                return res.status(404).json({ message: "Beatmap not found" });
            }

            // Add beatmap to beatmaps if not already present
            if (!round.beatmaps.some((bm: any) => bm._id.toString() === beatmap._id.toString())) {
                round.beatmaps.push(beatmap._id);
            }
            // Update or add to beatmapOrder
            if (!Array.isArray(round.beatmapOrder)) round.beatmapOrder = [];
            const existingEntry = round.beatmapOrder.find((e: any) => e.order === index);
            if (existingEntry) {
                existingEntry.beatmapId = beatmap._id;
            } else {
                round.beatmapOrder.push({ beatmapId: beatmap._id, order: index });
            }
            round.markModified("beatmaps");
            round.markModified("beatmapOrder");
            await round.save();
            // No need to reconstruct or sort beatmaps for display
            if (round) {
                return res.status(200).json({ message: "Beatmap updated successfully!", round });
            } else {
                return res.status(500).json({ message: "Unexpected error: round not found after save." });
            }
        }
    }
}

export default new RoundController();
