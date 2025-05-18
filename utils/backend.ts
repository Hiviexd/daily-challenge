import { IOsuAuthResponse, IBeatmapWithNotes } from "../interfaces/OsuApi";
import moment from "moment";

export function setSession(session, response: IOsuAuthResponse) {
    // set the cookie's maxAge to 7 days
    session.cookie.maxAge = moment.duration(7, "days").asMilliseconds();

    // *1000 because maxAge is miliseconds, oauth is seconds
    session.expireDate = Date.now() + response.expires_in * 1000;
    session.accessToken = response.access_token;
    session.refreshToken = response.refresh_token;
}

/** Just replaces () and [] */
export function escapeUsername(username: string) {
    username = username.trim();
    return username.replace(/[()[\]]/g, "\\$&");
}

export const defaultErrorMessage = { error: "Something went wrong!" };

type DiscordTimestampType =
    | "relative"
    | "shortTime"
    | "longTime"
    | "shortDate"
    | "longDate"
    | "dateTime"
    | "dayDateTime";

/**
 * Creates a dynamic Discord timestamp
 * @param date Date to convert
 * @param type Type of timestamp (defaults to `relative`)
 */
export function discordTimestamp(date: Date, type: DiscordTimestampType = "relative"): string {
    const types: Record<DiscordTimestampType, string> = {
        relative: "R",
        shortTime: "t",
        longTime: "T",
        shortDate: "d",
        longDate: "D",
        dateTime: "f",
        dayDateTime: "F",
    };
    return `<t:${Math.floor(date.getTime() / 1000)}:${types[type]}>`;
}

/**
 * Validates a MongoDB ObjectId
 * @param id ID to validate
 */
export function isValidMongoId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Truncates a filename to a certain length
 * @param filename Filename to truncate
 * @param maxLength Maximum length of the filename (defaults to `30`)
 */
export function truncateFilename(filename: string, maxLength: number = 30): string {
    if (filename.length <= maxLength) return filename;

    const extension = filename.includes(".") ? filename.split(".").pop()! : "";
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);

    return `${truncatedName}[...]${extension ? "." + extension : ""}`;
}

export function validateOsuProfileLink(input: string): string | null {
    const urlPattern = /^(?:https?:\/\/)?osu\.ppy\.sh\/users\/([\w\-[\]]+)\/?$/i;

    const urlMatch = input.match(urlPattern);

    if (urlMatch) {
        const value = urlMatch[1];
        return value;
    }

    return null;
}

/** * Delay execution for specified milliseconds */
export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Sanitizes user input string into a set of beatmap IDs
 * @param input The input string to sanitize
 * @returns A set of beatmap IDs
 */
export function sanitizeBeatmapInput(input: string): Set<number> {
    const ids = new Set<number>();

    // Remove mode-specific tags
    const cleanInput = input.replace(/#(?:osu|taiko|fruits|mania)/g, "");

    // Split by any combination of delimiters (newlines, commas, spaces, tabs)
    const parts = cleanInput.split(/[\n,\s\t]+/).filter((part) => part.length > 0);

    for (const part of parts) {
        try {
            // Extract ID from URL or use the part directly
            let processedPart = part;
            if (part.includes("/")) {
                processedPart = part.split("/").pop() || "";
            }

            const id = parseInt(processedPart);
            if (!isNaN(id)) {
                ids.add(id);
            }
        } catch {
            // Skip invalid parts instead of returning empty set
            continue;
        }
    }

    return ids;
}

/**
 * Sorts beatmaps by their status
 * * Order: graveyard -> pending -> loved -> approved -> qualified -> ranked
 * @param beatmaps Beatmaps to sort
 * @returns Sorted beatmaps
 */
export function sortBeatmapsByStatus(beatmaps: IBeatmapWithNotes[]) {
    const statusOrder = ["graveyard", "pending", "loved", "approved", "qualified", "ranked"];
    return beatmaps.sort((a, b) => statusOrder.indexOf(a.beatmapset.status) - statusOrder.indexOf(b.beatmapset.status));
}

/**
 * Sets a date to noon (12:00:00)
 * @param date Date to set to noon
 * @returns Date set to noon
 */
export function setDateToNoon(date: string | Date): Date {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
}

/**
 * Console styles
 */

const stylesCodes = {
    // Colors
    cyan: "\x1b[36m",
    red: "\x1b[31m",
    orange: "\x1b[38;5;208m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    magenta: "\x1b[35m",

    // Modifiers
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    reset: "\x1b[0m",
} as const;

export type StyleName = keyof typeof stylesCodes;

/**
 * Applies multiple styles to text
 * @param text The text to style
 * @param styles Array of styles to apply
 * @example
 * consoleStyles("Hello World", ["cyan", "underline"])
 * consoleStyles("Error message", ["red", "italic"])
 */
export const consoleStyles = (text: string, styleNames: StyleName[]) => {
    const codes = styleNames.map((name) => {
        if (!(name in stylesCodes)) {
            throw new Error(`Invalid style name: ${name}`);
        }
        return stylesCodes[name];
    });

    return `${codes.join("")}${text}${stylesCodes.reset}`;
};
