import { IRound, IWarning } from "@interfaces/Round";
import { IBeatmap } from "@interfaces/Beatmap";

class RoundService {
    /**
     * Check for duplicate beatmaps in a round
     * @param round - The round to check
     * @param allRounds - All rounds to check against
     * @returns An array of warnings
     */
    public checkDuplicates(round: IRound, allRounds: IRound[]): IWarning[] {
        // Skip duplicate check if beatmaps is empty or contains only null/undefined
        if (!Array.isArray(round.beatmaps) || round.beatmaps.every((bm) => !bm)) {
            return [];
        }
        const warnings: IWarning[] = [];

        // Gather all beatmaps from allRounds except the current round
        const otherBeatmaps: IBeatmap[] = allRounds
            .filter((r) => r._id.toString() !== round._id.toString())
            .flatMap((r) => r.beatmaps.filter(Boolean));

        round.beatmaps.forEach((beatmap) => {
            if (!beatmap) return;
            // Check for duplicate difficulties (same beatmapId)
            const duplicateDiffs = otherBeatmaps.filter(
                (b) => b.beatmapId?.toString() === beatmap.beatmapId?.toString()
            );
            if (duplicateDiffs.length > 0) {
                // Find the rounds where these duplicates are found
                const duplicateRounds = allRounds
                    .filter(
                        (r) =>
                            r._id.toString() !== round._id.toString() &&
                            r.beatmaps.some((b) => b && b.beatmapId?.toString() === beatmap.beatmapId?.toString())
                    )
                    .map((r) => r.title);
                warnings.push({
                    targetBeatmapId: beatmap.beatmapId?.toString(),
                    type: "duplicate_difficulty",
                    duplicates: duplicateRounds,
                });
                return; // Only one warning per beatmap, skip set check
            }

            // Check for duplicate sets (same beatmapsetId)
            const duplicateSets = otherBeatmaps.filter(
                (b) => b.beatmapsetId?.toString() === beatmap.beatmapsetId?.toString()
            );
            if (duplicateSets.length > 0) {
                // Find the rounds where these duplicates are found
                const duplicateRounds = allRounds
                    .filter(
                        (r) =>
                            r._id.toString() !== round._id.toString() &&
                            r.beatmaps.some((b) => b && b.beatmapsetId?.toString() === beatmap.beatmapsetId?.toString())
                    )
                    .map((r) => r.title);
                warnings.push({
                    targetBeatmapId: beatmap.beatmapId?.toString(),
                    type: "duplicate_set",
                    duplicates: duplicateRounds,
                });
                return; // Only one warning per beatmap, skip song check
            }

            // Check for duplicate songs (same lowercase artist and title)
            if (beatmap.artist && beatmap.title) {
                const beatmapArtist = beatmap.artist.toLowerCase();
                const beatmapTitle = beatmap.title.toLowerCase();
                const duplicateSongs = otherBeatmaps.filter(
                    (b) =>
                        b.artist &&
                        b.title &&
                        b.artist.toLowerCase() === beatmapArtist &&
                        b.title.toLowerCase() === beatmapTitle
                );
                if (duplicateSongs.length > 0) {
                    // Find the rounds where these duplicates are found
                    const duplicateRounds = allRounds
                        .filter(
                            (r) =>
                                r._id.toString() !== round._id.toString() &&
                                r.beatmaps.some(
                                    (b) =>
                                        b &&
                                        b.artist &&
                                        b.title &&
                                        b.artist.toLowerCase() === beatmapArtist &&
                                        b.title.toLowerCase() === beatmapTitle
                                )
                        )
                        .map((r) => r.title);
                    warnings.push({
                        targetBeatmapId: beatmap.beatmapId?.toString(),
                        type: "duplicate_song",
                        duplicates: duplicateRounds,
                    });
                }
            }
        });
        return warnings;
    }

    /**
     * Check if a date range is already taken by any round
     * @param startDate - The start date to check
     * @param endDate - The end date to check
     * @param allRounds - All rounds to check against
     * @returns true if the date range is taken, false otherwise
     */
    public checkIsDateRangeTaken(startDate: Date, endDate: Date, allRounds: IRound[]): boolean {
        const newStart = new Date(startDate).getTime();
        const newEnd = new Date(endDate).getTime();
        return allRounds.some((round) => {
            const roundStart = new Date(round.startDate).getTime();
            const roundEnd = new Date(round.endDate).getTime();
            return roundStart <= newEnd && roundEnd >= newStart;
        });
    }

    /**
     * Censor the active round by removing beatmaps that fall under future date slots
     * @param rounds - The list of rounds
     * @returns The rounds with the active round censored
     */
    public censorActiveRound(rounds: IRound[]): IRound[] {
        const now = new Date();
        rounds.forEach((round) => {
            if (!round.isActive) return;
            const start = new Date(round.startDate);
            const dayOffset = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            // Only keep beatmaps/beatmapOrder whose order <= dayOffset
            round.beatmapOrder = round.beatmapOrder.filter((entry) => entry.order <= dayOffset);
            round.beatmaps = round.beatmaps.filter((bm) =>
                round.beatmapOrder.some((entry) => bm._id?.toString() === entry.beatmapId?.toString())
            );
        });
        return rounds;
    }
}

export default new RoundService();
