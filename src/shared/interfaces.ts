import { Document, ObjectId } from "mongoose";
import { Request } from "express";

export interface IRequest extends Request {
  token?: string;
  user?: IUser;
}

export interface IErrMsg extends Error {
  status?: number;
  httpStatusCode?: number;
  message: string;
}

// Users
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
  token: string;
}

export interface IUserLogin extends Document {
  _id: ObjectId;
  user: string;
  password: string;
}

// Room / Game
export interface IRoom extends Document {
  // TODO implement after user is created
  creator?: string;
  // users?: IUser[];
  users: string[];
  draw?: IPlayers[];
  guess?: IPlayers[];
  endedAt: Date;
  words: string[];
  difficulty: difficulty;
  mode?: string[];
  status: string;
  round?: string;
}

export interface IPlayers {
  round: number;
  users: string[];
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
