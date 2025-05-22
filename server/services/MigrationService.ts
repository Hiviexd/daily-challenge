// base imports
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from "url";

// rounds migration imports
import Round from "@models/roundModel";
import User from "@models/userModel";
import utils from "@utils/index";
import BeatmapService from "@services/BeatmapService";
import UserService from "./UserService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MigrationService {
    public async migrateRounds() {
        if (!process.env.MIGRATION || process.env.MIGRATION !== "true") return;
        console.log(utils.consoleStyles("⚠  Migrating rounds...", ["orange", "bold", "underline"]));

        // get osu! token for user/beatmap creation
        // ! I am too lazy to remake a whole abstraction just for a one-time use thing.
        // ! Just get a client credentials token with the `public` scope and put it here.
        const osuToken = "insert token here";

        // import csv file from ./data/rounds.csv
        const rounds = fs.readFileSync(path.join(__dirname, "./data/output.csv"), "utf8");
        // parse csv file
        const parsedRounds = parse(rounds, {
            columns: true,
            skip_empty_lines: true,
        });

        // Start on may 29th 2025, and go back by 7 days on each iteration
        let originalStartDate = utils.toUTCDateOnly(new Date("2025-05-29"));

        // add 7 days to the original start date to account for the first round
        originalStartDate.setDate(originalStartDate.getDate() + 7);

        for (const round of parsedRounds) {
            const startDate = new Date(originalStartDate);
            startDate.setDate(startDate.getDate() - 7);
            originalStartDate = startDate;

            // endDate is startDate + 7 days
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);

            let assignedUser = await UserService.findOrCreateUser(osuToken, round["assigned user"]);

            if (!assignedUser) {
                console.log(
                    utils.consoleStyles(`User ${round["assigned user"]} not found, falling back to Hivie`, [
                        "red",
                        "bold",
                    ])
                );
                assignedUser = await User.findByUsernameOrOsuId("Hivie");
            }

            const theme = round["theme"] || "";

            // create round
            const roundData = new Round({
                startDate,
                endDate,
                theme,
                assignedUser: assignedUser._id,
                beatmaps: [],
                beatmapOrder: [],
            });

            await roundData.save();

            const beatmapIds: string[] = round["beatmaps"].split(",").map((beatmap: string) => beatmap.trim());

            for (let i = 0; i < beatmapIds.length; i++) {
                const beatmapId = beatmapIds[i];
                const beatmapData = await BeatmapService.getOrCreateBeatmap(beatmapId, osuToken);

                if (!beatmapData) {
                    console.log(utils.consoleStyles(`Beatmap ${beatmapId} not found`, ["red", "bold"]));
                    continue;
                }

                // insert beatmap into round and beatmapOrder
                roundData.beatmaps.push(beatmapData._id);
                roundData.beatmapOrder.push({ beatmapId: beatmapData._id, order: i });

                console.log(
                    utils.consoleStyles(`Inserted beatmap ${beatmapId} into round ${roundData._id}`, ["green", "bold"])
                );
            }

            await roundData.save();

            console.log(utils.consoleStyles(`Round ${roundData.title} saved`, ["green", "bold"]));
        }
    }
}

export default new MigrationService();
