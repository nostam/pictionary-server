import { CookieOptions } from "express";
import { env } from "../shared/functions";
export const JWT_SECRET = process.env.JWT_SECRET!;
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET!;

// ovewrite is true by default

const DynCookiesCfg = () => {
  return {
    sameSite: env("env") === "development" ? true : "none",
    secure: env("env") === "development" ? false : true,
  };
};

export const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  path: "/",
  maxAge: 900000,
  ...DynCookiesCfg,
};
export const refreshTokenOptions: CookieOptions = {
  httpOnly: true,
  path: "/users/refreshToken",
  maxAge: 604800000,
  ...DynCookiesCfg,
};
export const rmbOptions: CookieOptions = {
  path: "/",
  ...DynCookiesCfg,
};
