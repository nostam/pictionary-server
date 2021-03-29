import { CookieOptions } from "express";

export const JWT_SECRET = process.env.JWT_SECRET!;
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET!;

// ovewrite is true by default
export const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "none",
  secure: true,
};
export const refreshTokenOptions: CookieOptions = {
  httpOnly: true,
  path: "/users/refreshToken",

  sameSite: "none",
  secure: true,
};
