import express from "express";
import RoundController from "@controllers/RoundController";
import auth from "@middlewares/auth";
import { dynamicRateLimit } from "@middlewares/ratelimit";

const roundRouter = express.Router();

roundRouter.get("/", auth.optionalAuth, dynamicRateLimit, RoundController.index);
roundRouter.post("/create", auth.isLoggedIn, auth.isStaff, RoundController.create);
roundRouter.put("/:roundId/update", auth.isLoggedIn, auth.isStaff, RoundController.update);
roundRouter.put("/:roundId/updateBeatmapId", auth.isLoggedIn, auth.isStaff, RoundController.updateBeatmapId);
roundRouter.put("/:roundId/updateBeatmapNote", auth.isLoggedIn, auth.isStaff, RoundController.updateBeatmapNote);
roundRouter.get("/:id/checkDuplicates", auth.isLoggedIn, auth.isStaff, RoundController.checkDuplicates);

export default roundRouter;
