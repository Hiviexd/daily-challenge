import axios from "axios";
import { IUser } from "@interfaces/User";
import { notifications } from "@mantine/notifications";
import * as d3 from "d3";

export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
    status?: number;
}

/**
 * Handle an API error
 * @param error The error object
 * @returns The error object
 */
export const handleApiError = (error: any) => {
    return {
        error: error.response?.data?.error || error.response?.data?.message || error.message || "Unknown error",
        status: error.response?.status || 500,
        message: error.response?.data?.message,
    };
};

export type ApiCallParams = {
    method: "get" | "post" | "put" | "patch" | "delete";
    url: string;
    data?: any;
    params?: any;
    headers?: any;
    responseType?: string;
};

/**
 * API call handler
 * @example
 *   const result = await apiCall<IVoting[]>({ method: "get", url: "/api/votes" });
 *   // result is IVoting[] | ApiResponse<IVoting[]>
 */
export const apiCall = async <T = any>({
    method,
    url,
    data,
    params,
    headers,
    responseType,
}: ApiCallParams): Promise<T | ApiResponse<T> | any> => {
    try {
        const config: any = { headers };

        if (params) config.params = params;
        if (responseType) config.responseType = responseType;

        let response: any;

        if (method === "get" || method === "delete") {
            response = await axios[method](url, config);
        } else {
            response = await axios[method](url, data, config);
        }

        return responseType ? response : response.data;
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Handle a mutation response and emit a notification
 * @param response The response from the mutation
 * @returns The data from the response
 */
export const handleMutationResponse = <T>(response: ApiResponse<T>): T => {
    const successMessage = response.message || "Action successful!";
    if (response.error) {
        notifications.show({
            title: response.status ? `Error (${response.status})` : "Error",
            message: response.error,
            color: "red",
        });
        throw new Error(response.error);
    }

    notifications.show({
        title: "Success",
        message: successMessage,
        color: "green",
    });

    return response.data || (response as unknown as T);
};

/**
 * Copy text to clipboard and emit a notification
 * @param text The text to copy
 */
export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifications.show({
        title: "Success",
        message: "Copied to clipboard!",
        color: "success",
    });
};

/**
 * Check if a http request is valid (doesn't contain an error)
 */
export function httpIsValid(response) {
    return response && response.error === undefined;
}

/**
 * Check if the user has the required permissions to view a component
 * @param user The user object
 * @param permissions Array of permissions required to view the component
 */
export function hasRequiredPermissions(user: IUser | null, permissions: string[]): boolean {
    // No permissions required
    if (!permissions.length) return true;

    // No user, only allow if no permissions are required
    if (!user) return !permissions.length;

    // Admin bypass
    if (user.isAdmin) return true;

    // Check if user has the required permissions
    if (
        (permissions.includes("admin") && !user.isAdmin) ||
        (permissions.includes("access") && !user.hasAccess) ||
        (permissions.includes("staff") && !user.isStaff) ||
        (permissions.includes("spectator") && !user.isSpectator)
    )
        return false;

    return true;
}

/**
 * Convert a hex color to HSL
 */
export function hexToHsl(hex: string): [number, number, number] {
    // Remove # if present
    hex = hex.replace("#", "");

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find greatest and smallest channel values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Convert HSL to a hex color
 * @param h Hue
 * @param s Saturation (between 0 and 1)
 * @param l Lightness (between 0 and 1)
 */
export function hslToHex(h: number, s: number, l: number): string {
    h /= 360;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// https://github.com/ppy/osu-web/blob/87212089ea72cae7c6dbcde78450516181ccb96c/resources/js/utils/beatmap-helper.ts
const difficultyColourSpectrum = d3
    .scaleLinear<string>()
    .domain([0.1, 1.25, 2, 2.5, 3.3, 4.2, 4.9, 5.8, 6.7, 7.7, 9])
    .clamp(true)
    .range([
        "#4290FB",
        "#4FC0FF",
        "#4FFFD5",
        "#7CFF4F",
        "#F6F05C",
        "#FF8068",
        "#FF4E6F",
        "#C645B8",
        "#6563DE",
        "#18158E",
        "#000000",
    ])
    .interpolate(d3.interpolateRgb.gamma(2.2));

/**
 * Get the difficulty color for a given rating
 * @param rating The rating to get the color for
 * @returns The difficulty color
 */
export function getDifficultyColor(rating: number) {
    if (rating < 0.1) return "#AAAAAA";
    if (rating >= 9) return "#000000";
    return difficultyColourSpectrum(rating);
}
