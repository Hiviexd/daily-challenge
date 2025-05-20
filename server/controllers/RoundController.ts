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

        rounds = RoundService.checkDuplicates(rounds, rounds);

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

        if (theme) round.theme = theme;
        if (assignedUserId) round.assignedUser = assignedUserId;
        await round.save();

        return res.status(200).json({ message: "Round updated successfully!", round });
    }

    public async updateBeatmapId(req: Request, res: Response) {
        const { roundId } = req.params;
        const { index, beatmapId } = req.body;

        const round = await Round.findById(roundId).populate(DEFAULT_POPULATE);
        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        // Delete beatmap if beatmapId is empty or null
        if ((beatmapId === "" || beatmapId === null) && index !== undefined) {
            if (Array.isArray(round.beatmapOrder)) {
                // Find the entry for this index
                const entryIdx = round.beatmapOrder.findIndex((e: any) => e.order === index);
                if (entryIdx !== -1) {
                    const removed = round.beatmapOrder.splice(entryIdx, 1)[0];
                    // Remove from beatmaps if not used elsewhere
                    if (removed && removed.beatmapId) {
                        const stillUsed = round.beatmapOrder.some(
                            (e: any) => e.beatmapId.toString() === removed.beatmapId.toString()
                        );
                        if (!stillUsed) {
                            round.beatmaps = round.beatmaps.filter(
                                (bm: any) => bm._id.toString() !== removed.beatmapId.toString()
                            );
                        }
                    }
                    round.markModified("beatmaps");
                    round.markModified("beatmapOrder");
                    await round.save();
                }
            }
            return res.status(200).json({ message: "Beatmap deleted from round", round });
        }

        // Replace/set beatmap at index
        if (beatmapId !== undefined && beatmapId !== "" && beatmapId !== null && index !== undefined) {
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
            return res.status(200).json({ message: "Beatmap updated successfully!", round });
        }

        return res.status(400).json({ message: "Invalid request for updateBeatmapId" });
    }

    public async updateBeatmapNote(req: Request, res: Response) {
        const { roundId } = req.params;
        const { index, notes } = req.body;

        const round = await Round.findById(roundId).populate(DEFAULT_POPULATE);
        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        if (typeof notes === "string" && index !== undefined) {
            if (Array.isArray(round.beatmapOrder)) {
                const entry = round.beatmapOrder.find((e: any) => e.order === index);
                if (entry) {
                    const bm = round.beatmaps.find((bm: any) => bm._id.toString() === entry.beatmapId.toString());
                    if (bm) {
                        bm.notes = notes;
                        await bm.save();
                    }
                }
            }
            await round.save();
            return res.status(200).json({ message: "Beatmap notes updated successfully!", round });
        }
        return res.status(400).json({ message: "Invalid request for updateBeatmapNote" });
    }
}

export default new RoundController();
