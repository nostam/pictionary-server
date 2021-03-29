import jwt from "jsonwebtoken";
import UserModel from "../../models/users";
import { APIError } from "../../shared/classes";
import { JWT_SECRET, REFRESH_JWT_SECRET } from "../../shared/constants";
import { IUser, IUserLogin } from "../../shared/interfaces";
import { ObjectId } from "mongoose";

interface IDocId {
  _id: ObjectId;
}

export async function authenticate(user: IUser) {
  try {
    const accessToken = await generateJWT({ _id: user._id });
    const refreshToken = await generateRefreshJWT({ _id: user._id });

    if (!accessToken || !refreshToken)
      throw new Error("Failed to generate tokens");
    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });

    await user.save();
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(error.message, 500);
  }
}

export function generateJWT(payload: IDocId) {
  return new Promise((res, rej) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: 9000 }, (err, token) => {
      if (err) rej(err);
      res(token);
    })
  );
}

export function verifyJWT(token: string) {
  return new Promise((res, rej) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      console.log("decoded: ", decoded);
      if (err) rej(err);
      res(decoded);
    });
  });
}

export function generateRefreshJWT(payload: IDocId) {
  return new Promise<string | undefined>((res, rej) =>
    jwt.sign(
      payload,
      REFRESH_JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );
}

export function verifyRefreshToken(token: string) {
  return new Promise<object | undefined>((res, rej) =>
    jwt.verify(token, REFRESH_JWT_SECRET, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );
}

export async function refreshToken(oldRefreshToken: string) {
  const decoded = (await verifyRefreshToken(oldRefreshToken)) as IUserLogin;

  if (!decoded) throw new APIError("Invalid refresh token", 400);
  const user = await UserModel.findOne({ _id: decoded._id });

  if (!user) throw new APIError(`Access is forbidden`, 403);
  const currentRefreshToken = user.refreshTokens.find(
    (t) => t.token === oldRefreshToken
  );

  if (!currentRefreshToken) throw new APIError(`Invalid refresh token`, 400);
  const accessToken = await generateJWT({ _id: user._id });
  const refreshToken = await generateRefreshJWT({ _id: user._id });

  if (!refreshToken || !accessToken) throw new Error("Fail to generate Tokens");
  const newRefreshTokens = user.refreshTokens
    .filter((t) => t.token !== oldRefreshToken)
    .concat({ token: refreshToken });
  user.refreshTokens = [...newRefreshTokens];

  await user.save();
  return { accessToken, refreshToken };
}
