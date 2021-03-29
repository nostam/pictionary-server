import { Request, Response, Router } from "express";
import UserModel from "../models/users";
import { accessTokenOptions, refreshTokenOptions } from "../shared/constants";
import { authenticate } from "./auth";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  res.status(201).send("Hello Test");
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    const user = await UserModel.findByCredentials(username, password);

    const { accessToken, refreshToken } = await authenticate(user);
    res
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .status(201)
      .send("Welcome back");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default router;
