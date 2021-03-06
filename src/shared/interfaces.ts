import { Document, ObjectId } from "mongoose";
import { Request, Express } from "express";

export interface IRequest extends Request {
  tokens?: { accessToken: string; refreshToken: string };
  token?: string;
}

export interface IErrMsg extends Error {
  status?: number;
  httpStatusCode?: number;
  message: string;
}

// Users
export interface IUser extends Document {
  username: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  avatar: string;
  status?: string;
  desciption?: string;
  role: string;
  googleId?: string;
  socketId?: string;
  refreshTokens?: RefreshToken[];
  point: number;
  color?: IPalette;
}

export interface IResUser extends Document {
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  avatar?: string;
  status?: string;
  desciption?: string;
  role?: string;
  googleId?: string;
  socketId?: string;
}
export interface RefreshToken {
  token: string;
}

export interface IUserLogin extends Document {
  _id: ObjectId;
  user: string;
  password: string;
}

// Room / Game
export interface IRoom extends Document {
  canvas?: string;
  // TODO implement after user is created
  creator?: string;
  users: IEmbedUser[];
  draw?: IPlayers[];
  guess?: IPlayers[];
  endedAt: Date;
  words: string[];
  difficulty: difficulty;
  mode?: string[];
  status: string;
  round?: string;
}

export interface IEmbedUser {
  _id?: string;
  username?: string;
  socketId: string;
  avatar?: string;
  point?: number;
}
export interface IPlayers {
  round: number;
  users: IEmbedUser[];
}

export interface IRoomChat {
  from: string;
  message: string;
  room: string;
  round: number;
}

export enum difficulty {
  easy = "Easy",
  normal = "Normal",
  hard = "Hard",
  lunatic = "Lunatic",
}

export interface ICanvas {
  from: string;
  room: string;
  dataURL: string;
}

export interface IDict extends Document {
  difficulty: string;
  words: string[];
}

export interface ITokenVerify {
  _id: string;
  iat: number;
  exp: number;
}

export interface IRoomBell {
  room: string;
  user: IUser;
}

export interface IPalette {
  primary: string;
  secondary: string;
}
