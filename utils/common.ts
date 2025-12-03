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

/**
 * Converts a JS Date to a UTC-only date (midnight UTC)
 * @param date The date to normalize
 * @returns Date at 00:00:00 UTC
 */
export function toUTCDateOnly(date: Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * Gets the current day index with Thursday as day 0 (UTC-based)
 * @returns Day index where Thursday = 0, Friday = 1, Saturday = 2, Sunday = 3, Monday = 4, Tuesday = 5, Wednesday = 6
 */
export function getCurrentDayIndex(): number {
    const currentDay = new Date().getUTCDay();
    return (currentDay + 3) % 7; // shift from sunday to thursday
}

/**
 * Checks if a week period qualifies as the first week of a month
 * A week qualifies if it has 4 or more days within days 1-7 of the majority month
 * @param startDate Start date of the week period
 * @param endDate End date of the week period
 * @returns true if the week has 4+ days in the first week (days 1-7) of the majority month
 */
export function checkIfFirstWeekOfMonth(startDate: Date, endDate: Date): boolean {
    // Normalize dates to UTC
    const start = toUTCDateOnly(startDate);
    const end = toUTCDateOnly(endDate);

    // Count days in each month to find majority month
    const monthCounts = new Map<string, number>();
    const current = new Date(start);

    while (current <= end) {
        const monthKey = `${current.getUTCFullYear()}-${current.getUTCMonth()}`;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
        current.setUTCDate(current.getUTCDate() + 1);
    }

    // Find the month with the majority of days
    let majorityMonthKey = "";
    let maxCount = 0;
    for (const [key, count] of monthCounts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            majorityMonthKey = key;
        }
    }

    // Parse the majority month
    const [year, month] = majorityMonthKey.split("-").map(Number);

    // Count days that overlap with days 1-7 of the majority month
    let overlapCount = 0;
    const checkDate = new Date(start);

    while (checkDate <= end) {
        const checkYear = checkDate.getUTCFullYear();
        const checkMonth = checkDate.getUTCMonth();
        const checkDay = checkDate.getUTCDate();

        if (checkYear === year && checkMonth === month && checkDay >= 1 && checkDay <= 7) {
            overlapCount++;
        }

        checkDate.setUTCDate(checkDate.getUTCDate() + 1);
    }

    return overlapCount >= 4;
}
