import { CookieOptions } from "express";

export const JWT_SECRET = process.env.JWT_SECRET!;
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET!;

// ovewrite is true by default
export const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  path: "/",
  maxAge: 900000,
  sameSite: process.env.NODE_ENV === "development" ? undefined : "none",
  secure: process.env.NODE_ENV === "development" ? undefined : true,
};
export const refreshTokenOptions: CookieOptions = {
  httpOnly: true,
  path: "/users/refreshToken",
  maxAge: 604800000,
  sameSite: process.env.NODE_ENV === "development" ? undefined : "none",
  secure: process.env.NODE_ENV === "development" ? undefined : true,
};
export const rmbOptions: CookieOptions = {
  path: "/",
  sameSite: process.env.NODE_ENV === "development" ? undefined : "none",
  secure: process.env.NODE_ENV === "development" ? undefined : true,
};
