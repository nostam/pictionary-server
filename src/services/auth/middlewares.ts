import { Response, NextFunction } from "express";
import UserModel from "../users/schema";
import { APIError } from "../../utils";
import { verifyJWT } from "./index";
import { IRequest, IUserLogin } from "../../shared/interfaces";

export async function authorize(
  req: IRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.accessToken;
    const decoded = (await verifyJWT(token)) as IUserLogin;
    const user = await UserModel.findById(decoded._id);
    if (!user) throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    next(new APIError("Please authenticate", 401));
  }
}

export function adminOnly(req: IRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new APIError("Unauthorized ", 403));
  }
}
