import { OsuGameMode } from "@interfaces/OsuApi";

export const MODE_LABELS: Record<OsuGameMode, string> = {
    osu: "osu!",
    taiko: "osu!taiko",
    fruits: "osu!catch",
    mania: "osu!mania",
};

export function getGameModeLabel(mode: OsuGameMode): string {
    return MODE_LABELS[mode];
}
