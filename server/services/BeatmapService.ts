import Beatmap from "@models/beatmapModel";
import OsuApiService from "@services/OsuApiService";

class BeatmapService {
    public async getOrCreateBeatmap(beatmapId: string | number, accessToken: string) {
        const beatmap = await Beatmap.findOne({ beatmapId: parseInt(beatmapId.toString()) });

        if (beatmap) return beatmap;

        const beatmapResponse = await OsuApiService.getBeatmap(beatmapId.toString(), accessToken);

        if (OsuApiService.isOsuResponseError(beatmapResponse)) {
            return null;
        }

        // prepare fields
        const newBeatmapId = beatmapResponse.id;
        const beatmapsetId = beatmapResponse.beatmapset_id;
        const starRating = beatmapResponse.difficulty_rating;
        const artist = beatmapResponse.beatmapset.artist;
        const title = beatmapResponse.beatmapset.title;
        const version = beatmapResponse.version;
        const cover = beatmapResponse.beatmapset.covers.cover;
        const rankedDate = new Date(beatmapResponse.beatmapset.ranked_date);
        const creator = {
            osuId: beatmapResponse.beatmapset.user_id,
            username: beatmapResponse.beatmapset.creator,
        };

        const newBeatmap = new Beatmap({
            beatmapId: newBeatmapId,
            beatmapsetId,
            starRating,
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
}

export default new BeatmapService();
