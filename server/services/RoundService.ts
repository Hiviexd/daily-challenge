import { IRound, IWarning } from "@interfaces/Round";
import { IBeatmap } from "@interfaces/Beatmap";

class RoundService {
    // Simple in-memory cache for duplicate checks
    private duplicateCheckCache = new Map<string, any>();

    private getRoundsCacheKey(rounds: IRound[]): string {
        // Use round IDs and updatedAt timestamps for cache key
        return rounds
            .map((r) => `${r._id?.toString?.() ?? r._id}:${(r as any).updatedAt ?? ""}`)
            .sort()
            .join("|");
    }

    // Cached version of checkDuplicates
    // TODO: remove caching and replace with a method that takes a round and checks its duplicates on-demand
    public checkDuplicatesWithCache(roundsToCheck: IRound[], allRounds: IRound[]) {
        const key = this.getRoundsCacheKey(allRounds);

        if (this.duplicateCheckCache.has(key)) {
            console.log("Returning duplicates cached result");
            return JSON.parse(JSON.stringify(this.duplicateCheckCache.get(key)));
        }

        console.log("Cache miss, checking duplicates");
        const result = this.checkDuplicates(roundsToCheck, allRounds);

        this.duplicateCheckCache.set(key, JSON.parse(JSON.stringify(result)));

        return result;
    }

    // Main duplicate check logic
    public checkDuplicates(roundsToCheck: IRound[], allRounds: IRound[]) {
        for (const round of roundsToCheck) {
            // Skip duplicate check if beatmaps is empty or contains only null/undefined
            if (!Array.isArray(round.beatmaps) || round.beatmaps.every((bm) => !bm)) {
                round.warnings = [];
                continue;
            }
            const warnings: IWarning[] = [];
            round.warnings = warnings;

            // Gather all beatmaps from allRounds except the current round
            const otherBeatmaps: IBeatmap[] = allRounds
                .filter((r) => r !== round)
                .flatMap((r) => r.beatmaps.filter(Boolean));

            round.beatmaps.forEach((beatmap, idx) => {
                if (!beatmap) return;
                // Check for duplicate difficulties (same beatmapId)
                const duplicateDiffs = otherBeatmaps.filter((b) => b.beatmapId === beatmap.beatmapId);
                if (duplicateDiffs.length > 0) {
                    // Find the rounds where these duplicates are found
                    const duplicateRounds = allRounds
                        .filter((r) => r !== round && r.beatmaps.some((b) => b && b.beatmapId === beatmap.beatmapId))
                        .map((r) => r.title);
                    warnings.push({
                        index: idx,
                        type: "duplicate_difficulty",
                        duplicates: duplicateRounds,
                    });
                    return; // Only one warning per beatmap, skip set check
                }

                // Check for duplicate sets (same beatmapsetId)
                const duplicateSets = otherBeatmaps.filter((b) => b.beatmapsetId === beatmap.beatmapsetId);
                if (duplicateSets.length > 0) {
                    // Find the rounds where these duplicates are found
                    const duplicateRounds = allRounds
                        .filter(
                            (r) => r !== round && r.beatmaps.some((b) => b && b.beatmapsetId === beatmap.beatmapsetId)
                        )
                        .map((r) => r.title);
                    warnings.push({
                        index: idx,
                        type: "duplicate_set",
                        duplicates: duplicateRounds,
                    });
                }
            });
        }
        return roundsToCheck;
    }
}

export default new RoundService();
