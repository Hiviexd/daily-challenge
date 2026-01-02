import { Request, Response } from "express";
import Round from "@models/roundModel";
import LogService from "@services/LogService";
import User from "@models/userModel";
import RoundService from "@services/RoundService";
import BeatmapService from "@services/BeatmapService";
import Beatmap from "@models/beatmapModel";

const DEFAULT_POPULATE = [{ path: "assignedUser", select: "username osuId groups" }, { path: "beatmaps" }];
const DEFAULT_LIMIT = 10;

const selectFields = (hasAccess: boolean) => {
    return hasAccess ? "" : "-assignedUser";
};

class RoundController {
    /** GET all rounds */
    public async index(req: Request, res: Response) {
        const loggedInUser = res.locals!.user;
        const hasAccess = !!(loggedInUser && loggedInUser.hasAccess);

        const cursor = req.query.cursor as string | undefined;
        const theme = req.query.theme as string | undefined;
        const date = req.query.date as string | undefined;
        const artistTitle = req.query.artistTitle as string | undefined;
        const creator = req.query.creator as string | undefined;

        const now = new Date();
        const query: any = hasAccess ? {} : { startDate: { $lte: now } };

        if (cursor) {
            query.startDate = { ...(query.startDate || {}), $lt: new Date(cursor) };
        }

        if (theme) {
            query.theme = { $regex: theme, $options: "i" };
        }

        if (date) {
            const d = new Date(date);
            query.startDate = { ...(query.startDate || {}), $lte: d };
            query.endDate = { $gte: d };
        }

        if (creator) {
            query.assignedUser = creator;
        }

        if (artistTitle) {
            // Step 1: Find matching beatmaps by artist or title
            const matchingBeatmaps = await Beatmap.find({
                $or: [
                    { artist: { $regex: artistTitle, $options: "i" } },
                    { title: { $regex: artistTitle, $options: "i" } },
                ],
            }).select("_id");
            const matchingIds = matchingBeatmaps.map((bm) => bm._id);
            // Step 2: Filter rounds by those beatmap IDs
            query.beatmaps = { $in: matchingIds.length > 0 ? matchingIds : [null] };
        }

        let rounds = await Round.find(query)
            .select(selectFields(hasAccess))
            .populate(DEFAULT_POPULATE)
            .sort({ startDate: -1 })
            .limit(DEFAULT_LIMIT);

        if (!hasAccess) {
            rounds = RoundService.censorActiveRound(rounds);
        }

        const nextCursor = rounds.length === DEFAULT_LIMIT ? rounds[rounds.length - 1].startDate.toISOString() : null;

        res.status(200).json({ rounds, nextCursor });
    }

    /** GET duplicate warnings for a round */
    public async checkDuplicates(req: Request, res: Response) {
        const { id } = req.params;

        const round = await Round.findById(id).populate(DEFAULT_POPULATE);

        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        const allRounds = await Round.find({}).populate(DEFAULT_POPULATE);
        const warnings = RoundService.checkDuplicates(round, allRounds);

        res.status(200).json({ warnings });
    }

    /* POST create round */
    public async create(req: Request, res: Response) {
        const { startDate, theme, assignedUserId } = req.body;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const loggedInUser = res.locals!.user!;

        const rounds = await Round.find({});

        // check if the date range is already taken
        const isDateRangeTaken = RoundService.checkIsDateRangeTaken(startDate, endDate, rounds);

        if (isDateRangeTaken) {
            return res.status(403).json({ message: "Date range is already taken" });
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
        });

        await round.save();

        res.status(201).json({ message: "Round created successfully!" });

        // logging
        LogService.generate(loggedInUser._id, `Created round: ${round.title}`);
    }

    /* PUT update round */
    public async update(req: Request, res: Response) {
        const { roundId } = req.params;
        const { theme, assignedUserId, startDate } = req.body;

        const loggedInUser = res.locals!.user!;

        const round = await Round.findById(roundId);

        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        if (typeof theme === "string") round.theme = theme;
        if (assignedUserId) round.assignedUser = assignedUserId;

        if (startDate) {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);

            const rounds = await Round.find({});
            const isDateRangeTaken = RoundService.checkIsDateRangeTaken(startDate, endDate, rounds);

            if (isDateRangeTaken) {
                return res.status(403).json({ message: "Date range is already taken" });
            }

            round.startDate = startDate;
            round.endDate = endDate;
        }

        await round.save();

        res.status(200).json({ message: "Round updated successfully!" });

        // logging
        LogService.generate(loggedInUser._id, `Updated round: ${round.title}`);
    }

    /* PUT update beatmapId for a round */
    public async updateBeatmapId(req: Request, res: Response) {
        const { roundId } = req.params;
        const { index, beatmapId } = req.body;

        const loggedInUser = res.locals!.user!;

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
            return res.status(200).json({ message: "Beatmap deleted from round!" });
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
                // Store the old beatmap ID before replacing
                const oldBeatmapId = existingEntry.beatmapId;

                // Replace with new beatmap
                existingEntry.beatmapId = beatmap._id;

                // Clean up old beatmap if it's no longer used
                if (oldBeatmapId) {
                    const stillUsed = round.beatmapOrder.some(
                        (e: any) => e.beatmapId.toString() === oldBeatmapId.toString()
                    );
                    if (!stillUsed) {
                        round.beatmaps = round.beatmaps.filter(
                            (bm: any) => bm._id.toString() !== oldBeatmapId.toString()
                        );
                    }
                }
            } else {
                round.beatmapOrder.push({ beatmapId: beatmap._id, order: index });
            }

            round.markModified("beatmaps");
            round.markModified("beatmapOrder");
            await round.save();
            res.status(200).json({ message: "Beatmap updated successfully!" });

            // logging
            LogService.generate(loggedInUser._id, `Updated beatmapId for round: ${round.title}`);
        } else {
            return res.status(400).json({ message: "Invalid request for updateBeatmapId" });
        }
    }

    /* PUT update beatmap note for a round */
    public async updateBeatmapNote(req: Request, res: Response) {
        const { roundId } = req.params;
        const { index, notes } = req.body;

        const loggedInUser = res.locals!.user!;

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
            res.status(200).json({ message: "Beatmap notes updated successfully!" });

            // logging
            LogService.generate(loggedInUser._id, `Updated beatmap notes for round: ${round.title}`);
        } else {
            return res.status(400).json({ message: "Invalid request for updateBeatmapNote" });
        }
    }

    /** DELETE round */
    public async delete(req: Request, res: Response) {
        const { roundId } = req.params;

        const loggedInUser = res.locals!.user!;

        const round = await Round.findById(roundId);
        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        await round.delete();

        res.status(200).json({ message: "Round deleted successfully!" });

        // logging
        LogService.generate(loggedInUser._id, `Deleted round: ${round.title}`);
    }
}

export default new RoundController();
