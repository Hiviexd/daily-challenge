import axios, { AxiosRequestConfig } from "axios";
import querystring from "querystring";
import utils from "@utils/index";
import { IBeatmap, IBeatmapResponse, IOsuAuthResponse, IOsuUser } from "@interfaces/OsuApi";
import { ErrorResponse } from "@interfaces/Responses";

import { loadJson } from "@utils/config";
import { IConfig } from "@interfaces/Config";

const config = loadJson<IConfig>("../config.json");

export default class OsuApiService {
    static isOsuResponseError<T>(errorResponse: T | ErrorResponse): errorResponse is ErrorResponse {
        return (errorResponse as ErrorResponse).error !== undefined;
    }

    protected static async executeRequest(options: AxiosRequestConfig) {
        try {
            const res = await axios(options);

            if (res?.data) {
                return res.data;
            }

            return utils.defaultErrorMessage;
        } catch (error) {
            return utils.defaultErrorMessage;
        }
    }

    static async getToken(code: string): Promise<IOsuAuthResponse | ErrorResponse> {
        const postData = querystring.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: config.osuApp.redirect,
            client_id: config.osuApp.id,
            client_secret: config.osuApp.secret,
        });

        const options: AxiosRequestConfig = {
            url: "https://osu.ppy.sh/oauth/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: postData,
        };

        return await this.executeRequest(options);
    }

    static async refreshToken(refreshToken: string): Promise<IOsuAuthResponse | ErrorResponse> {
        const postData = querystring.stringify({
            grant_type: "refresh_token",
            client_id: config.osuApp.id,
            client_secret: config.osuApp.secret,
            refresh_token: refreshToken,
        });

        const options: AxiosRequestConfig = {
            url: "https://osu.ppy.sh/oauth/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: postData,
        };

        return await this.executeRequest(options);
    }

    static async getLoggedInUserInfo(token: string): Promise<IOsuUser | ErrorResponse> {
        const options: AxiosRequestConfig = {
            url: "https://osu.ppy.sh/api/v2/me",
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return await this.executeRequest(options);
    }

    static async getUserInfo(token: string, userInput: string | number): Promise<IOsuUser | ErrorResponse> {
        const options: AxiosRequestConfig = {
            url: `https://osu.ppy.sh/api/v2/users/${userInput}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return await this.executeRequest(options);
    }

    static async getBeatmap(beatmapId: string, token: string): Promise<IBeatmap | ErrorResponse> {
        const options: AxiosRequestConfig = {
            url: `https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return await this.executeRequest(options);
    }

    // gets up to 50 beatmaps at a time, passed via an ids[] query parameter
    static async getBeatmaps(beatmapIds: string[], token: string): Promise<IBeatmapResponse> {
        const options: AxiosRequestConfig = {
            url: `https://osu.ppy.sh/api/v2/beatmaps`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            params: {
                ids: beatmapIds,
            },
        };

        return await this.executeRequest(options);
    }
}
