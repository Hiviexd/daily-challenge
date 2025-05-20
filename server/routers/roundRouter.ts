import express from "express";
import RoundController from "@controllers/RoundController";
import auth from "@middlewares/auth";

const roundRouter = express.Router();

roundRouter.get("/", auth.optionalAuth, RoundController.index);
roundRouter.post("/create", auth.isLoggedIn, auth.isStaff, RoundController.create);
roundRouter.put("/:roundId/update", auth.isLoggedIn, auth.isStaff, RoundController.update);
roundRouter.put("/:roundId/updateBeatmapId", auth.isLoggedIn, auth.isStaff, RoundController.updateBeatmapId);
roundRouter.put("/:roundId/updateBeatmapNote", auth.isLoggedIn, auth.isStaff, RoundController.updateBeatmapNote);

export default roundRouter;
