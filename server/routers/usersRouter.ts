import express from "express";
import UsersController from "../controllers/UsersController";
import auth from "../middlewares/auth";

const usersRouter = express.Router();

usersRouter.get("/me", auth.isLoggedIn, UsersController.getSelf);
usersRouter.get("/getStaff", auth.isStaff, UsersController.getStaff);

export default usersRouter;
