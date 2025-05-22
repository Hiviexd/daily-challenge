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
}

export default new RoundService();
