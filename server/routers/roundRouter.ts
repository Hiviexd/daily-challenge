import express from "express";
import RoundController from "../controllers/RoundController";
import auth from "../middlewares/auth";

const roundRouter = express.Router();

roundRouter.get("/", auth.optionalAuth, RoundController.index);
roundRouter.post("/create", auth.isLoggedIn, auth.isStaff, RoundController.create);

export default roundRouter;
