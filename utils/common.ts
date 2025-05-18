import moment from "moment";

/**
 * Shortens a string
 * @param string String to shorten
 * @param length Length of output string (defaults to `50`)
 */
export function shorten(string: string = "", length: number = 50): string {
    return string.length > length ? string.substring(0, length - 3) + "..." : string;
}

/**
 * Checks if a string is a valid whole number
 * @param str String to check
 */
export function isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
}

/**
 * Get the number of years from a number of days
 * @param days Number of days
 */
export function getYearsFromDays(days: number) {
    const duration = moment.duration(days, "days");
    return Math.floor(duration.asYears());
}

/**
 * Checks if a URL is valid
 * @param url URL to check
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Formats a game mode string
 * @param mode Game mode to format
 * @returns Formatted game mode
 */
export function formatGameMode(mode: string) {
    switch (mode) {
        case "osu":
            return "osu!";
        case "taiko":
            return "osu!taiko";
        case "catch":
            return "osu!catch";
        case "mania":
            return "osu!mania";
        default:
            return mode;
    }
}
