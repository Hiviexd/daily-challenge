import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

const loggedInLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute for logged-in users
    keyGenerator: (req: Request) => (req.session.mongoId ? String(req.session.mongoId) : req.ip || "unknown"),
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        error: "Too many requests, please try again in a bit.",
    },
});

const guestLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute for guests
    keyGenerator: (req: Request) => req.ip || "unknown",
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        error: "Too many requests, please try again in a bit, or sign in to increase your rate limit.",
    },
});

export function dynamicRateLimit(req: Request, res: Response, next: NextFunction) {
    const user = res.locals && (res.locals as any).user;
    if (user && user._id) {
        return loggedInLimiter(req, res as any, next);
    } else {
        return guestLimiter(req, res as any, next);
    }
}
