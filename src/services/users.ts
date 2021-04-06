import { Request, Response, Router } from "express";
import passport from "passport";
import UserModel from "../models/users";
import { accessTokenOptions, refreshTokenOptions } from "../shared/constants";
import { authenticate, getTokenPairs } from "./auth";
import { authorize } from "./auth/middlewares";
import { APIError } from "../shared/classes";
import { IRequest, IUser } from "../shared/interfaces";

const usersRouter = Router();

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findByCredentials(username, password);
    const { accessToken, refreshToken } = await authenticate(user);
    res
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .send({ user });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    next(new APIError("Refresh token missing", 400));
  } else {
    try {
      const { accessToken, refreshToken } = await getTokenPairs(
        oldRefreshToken
      );
      res
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .send("renewed");
    } catch (error) {
      next(error);
    }
  }
});

usersRouter.post("/logout", authorize, async (req: IRequest, res, next) => {
  try {
    const user = req.user as IUser;
    if (!user) throw new APIError("Unauthorized", 403);
    user.refreshTokens = user.refreshTokens!.filter(
      (t) => t.token !== req.cookies.refreshTokens
    );
    await user.save();
    res
      .clearCookie("accessToken", { path: "/" })
      .clearCookie("refreshToken", { path: "/users/refreshToken" })
      .send();
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/logoutAll", authorize, async (req: IRequest, res, next) => {
  try {
    const user = req.user as IUser;
    if (!user) throw new Error();

    user.refreshTokens = [];
    await user.save();
    res
      .clearCookie("accessToken", { path: "/" })
      .clearCookie("refreshToken", { path: "/users/refreshToken" })
      .send();
  } catch (err) {
    next(err);
  }
});

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      const myReq = req.user as IRequest;
      if (!myReq.tokens) throw new Error("Failed to authenticate");
      res
        .cookie("accessToken", myReq.tokens.accessToken, accessTokenOptions)
        .cookie("refreshToken", myReq.tokens.refreshToken, refreshTokenOptions)
        .redirect(`${process.env.FE_URL_PROD}`);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get("/me", authorize, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
