import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/users";
import { APIError } from "../../shared/classes";
import { verifyJWT } from "./index";
import { IRequest, IUser, IUserLogin } from "../../shared/interfaces";

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
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    next(new APIError("Please authenticate", 401));
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = req.user as IUser;
  if (user && user.role === "admin") {
    next();
  } else {
    next(new APIError("Unauthorized ", 403));
  }
}
