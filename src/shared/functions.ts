import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { getReasonPhrase } from "http-status-codes";
import { IErrMsg } from "./interfaces";
import logger from "./Logger";

export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing: process.env['${name}'].`);
  return value;
}

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

export const httpErrorHandler: ErrorRequestHandler = (
  err: IErrMsg,
  req,
  res,
  next
) => {
  logger.err(err, true);
  const status = err.status ?? 500;
  if (!res.headersSent) {
    return res.status(status).send({
      error: err.message ? err.message : getReasonPhrase(status),
    });
  }
  return res.status(status).send(getReasonPhrase(status));
};
