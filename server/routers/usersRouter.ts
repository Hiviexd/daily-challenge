import express from "express";
import UsersController from "@controllers/UsersController";
import auth from "@middlewares/auth";

const usersRouter = express.Router();

usersRouter.get("/me", auth.isLoggedIn, UsersController.getSelf);
usersRouter.get("/staff", auth.isLoggedIn, auth.isStaff, UsersController.getStaff);
usersRouter.get("/spectators", auth.isLoggedIn, auth.isAdmin, UsersController.getSpectators);
usersRouter.get("/staffStats", auth.isLoggedIn, auth.isAdmin, UsersController.getStaffStats);
usersRouter.get("/:userInput", auth.isLoggedIn, auth.isAdmin, UsersController.findOrCreateUser);
usersRouter.patch("/:userInput/groupMove", auth.isLoggedIn, auth.isAdmin, UsersController.handleGroupMove);

export default usersRouter;
