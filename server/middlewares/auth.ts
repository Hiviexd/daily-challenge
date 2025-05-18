import User from "../models/userModel";
import utils from "../../utils";
import OsuApiService from "../services/OsuApiService";
import { Request, Response, NextFunction } from "express";

/**
 * Unauthorized middleware
 * @param req
 * @param res
 * @param next
 */
function unauthorize(req: Request, res: Response) {
    if (req.accepts(["html", "json"]) === "json") {
        res.json({ error: "Unauthorized, login first" });
    } else {
        res.redirect("/");
    }
}

/**
 * Check if user is logged in, and assign user to res.locals
 * @param req
 * @param res
 * @param next
 */
async function isLoggedIn(req: Request, res: Response, next: NextFunction) {
    const user = await User.findById(req.session.mongoId);

    if (!user) {
        return unauthorize(req, res);
    }

    // Refresh if less than 2 hours left for some possible edge cases
    if (new Date() > new Date(req.session.expireDate! - 2 * 3600 * 1000)) {
        const response = await OsuApiService.refreshToken(req.session.refreshToken!);

        if (!response || OsuApiService.isOsuResponseError(response)) {
            req.session.destroy((error) => {
                console.log(error);
            });

            return res.redirect("/");
        }

        utils.setSession(req.session, response);
    }

    res.locals!.user = user;
    next();
}

/**
 * Check if user has access to management stuff
 * @param req
 * @param res
 * @param next
 */
function hasAccess(req: Request, res: Response, next: NextFunction) {
    const user = res.locals!.user;
    if (!user || !user.hasAccess) return unauthorize(req, res);

    next();
}

/**
 * Check if user is staff
 * @param req
 * @param res
 * @param next
 */
function isStaff(req: Request, res: Response, next: NextFunction) {
    const user = res.locals!.user;
    if (!user || !user.isStaff) return unauthorize(req, res);

    next();
}

/**
 * Check if user is spectator
 * @param req
 * @param res
 * @param next
 */
function isSpectator(req: Request, res: Response, next: NextFunction) {
    const user = res.locals!.user;
    if (!user || !user.isSpectator) return unauthorize(req, res);

    next();
}

/**
 * Optional authentication middleware
 * Allows logged-out users to access routes, but still sets res.locals for logged-in users
 * @param req
 * @param res
 * @param next
 */
async function optionalAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session || !req.session.mongoId) {
        return next();
    }

    const user = await User.findById(req.session.mongoId);

    if (!user) {
        return next();
    }

    // Refresh token if less than 2 hours left
    if (req.session.expireDate && new Date() > new Date(req.session.expireDate - 2 * 3600 * 1000)) {
        const response = await OsuApiService.refreshToken(req.session.refreshToken!);

        if (!response || OsuApiService.isOsuResponseError(response)) {
            req.session.destroy((error) => {
                console.log(error);
            });

            return next();
        }

        utils.setSession(req.session, response);
    }

    res.locals!.user = user;
    next();
}

export default {
    isLoggedIn,
    hasAccess,
    isStaff,
    isSpectator,
    optionalAuth,
};
