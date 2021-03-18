import { Document } from "mongoose";

export const accessTokenOptions = {
  httpOnly: true,
  path: "/",
  overwrite: true,
  sameSite: "None",
  secure: true,
};
export const refreshTokenOptions = {
  httpOnly: true,
  path: "/users/refreshToken",
  overwrite: true,
  sameSite: "None",
  secure: true,
};
export interface IErrMsg extends Error {
  status?: number;
  httpStatusCode?: number;
  message: string;
}
export interface IUser extends Document {
  nickname?: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  avatar?: string;
  status?: string;
  desciption?: string;
  role?: string;
  googleId?: string;
  socketId?: string;
  refreshTokens: RefreshToken[];
}

export interface IResUser extends Document {
  nickname?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  status?: string;
  desciption?: string;
  role?: string;
  googleId?: string;
  socketId?: string;
}
export interface RefreshToken {
  tokens: string;
}

export interface IRoom extends Document {
  creator: string;
  users: IUser[];
  startedAt: Date;
  endedAt: Date;
  words: string[];
  difficulty: difficulty;
  mode?: string[];
}

export interface IRoomChat {
  from: string;
  message: string;
  room: string;
  round: number;
}

export enum difficulty {
  easy,
  normal,
  hard,
  lunatic,
}
