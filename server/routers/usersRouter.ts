import express from "express";
import UsersController from "@controllers/UsersController";
import auth from "@middlewares/auth";

const usersRouter = express.Router();

usersRouter.get("/me", auth.isLoggedIn, UsersController.getSelf);
usersRouter.get("/staff", auth.isLoggedIn, auth.isStaff, UsersController.getStaff);

export default usersRouter;
