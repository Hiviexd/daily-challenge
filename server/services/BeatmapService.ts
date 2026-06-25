import Beatmap from "@models/beatmapModel";
import OsuApiService from "@services/OsuApiService";
import { IBeatmap as IOsuBeatmap } from "@interfaces/OsuApi";
import { normalizeOsuGameMode } from "@utils/mods";

function getSlimCoverUrl(beatmapResponse: IOsuBeatmap) {
    return beatmapResponse.beatmapset.covers["slimcover@2x"];
}

class BeatmapService {
    public async getOrCreateBeatmap(beatmapId: string | number, accessToken: string) {
        const beatmap = await Beatmap.findOne({ beatmapId: parseInt(beatmapId.toString()) });

        if (beatmap?.mode) return beatmap;

        const beatmapResponse = await OsuApiService.getBeatmap(beatmapId.toString(), accessToken);

        if (OsuApiService.isOsuResponseError(beatmapResponse)) {
            return beatmap ?? null;
        }

        const mode = normalizeOsuGameMode(beatmapResponse.mode);

        if (beatmap) {
            if (!beatmap.mode && mode) {
                beatmap.mode = mode;
                await beatmap.save();
            }
            return beatmap;
        }

        // prepare fields
        const newBeatmapId = beatmapResponse.id;
        const beatmapsetId = beatmapResponse.beatmapset_id;
        const starRating = beatmapResponse.difficulty_rating;
        const artist = beatmapResponse.beatmapset.artist;
        const title = beatmapResponse.beatmapset.title;
        const version = beatmapResponse.version;
        const cover = getSlimCoverUrl(beatmapResponse);
        const rankedDate = new Date(beatmapResponse.beatmapset.ranked_date);
        const creator = {
            osuId: beatmapResponse.beatmapset.user_id,
            username: beatmapResponse.beatmapset.creator,
        };

        const newBeatmap = new Beatmap({
            beatmapId: newBeatmapId,
            beatmapsetId,
            starRating,
            mode,
            artist,
            title,
            version,
            cover,
            rankedDate,
            creator,
        });

        await newBeatmap.save();

        return newBeatmap;
    }

    public async syncBeatmap(beatmapId: string | number, accessToken: string) {
        const beatmap = await Beatmap.findOne({ beatmapId: parseInt(beatmapId.toString()) });
        if (!beatmap) return null;

        const beatmapResponse = await OsuApiService.getBeatmap(beatmapId.toString(), accessToken);
        if (OsuApiService.isOsuResponseError(beatmapResponse)) {
            return null;
        }

        const mode = normalizeOsuGameMode(beatmapResponse.mode);
        const cover = getSlimCoverUrl(beatmapResponse);

        let dirty = false;
        if (mode && beatmap.mode !== mode) {
            beatmap.mode = mode;
            dirty = true;
        }
        if (cover && beatmap.cover !== cover) {
            beatmap.cover = cover;
            dirty = true;
        }

        if (dirty) {
            await beatmap.save();
        }

        return beatmap;
    }
}

export default new BeatmapService();
