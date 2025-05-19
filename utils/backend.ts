import { IOsuAuthResponse } from "@interfaces/OsuApi";
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

/** * Sleep for specified milliseconds */
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

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
