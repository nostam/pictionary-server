import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { getReasonPhrase } from "http-status-codes";

import { IErrMsg } from "./constants";
import logger from "./Logger";
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
  if (!res.headersSent) {
    return res.status((err.status = 500)).send({
      error: err.message ? err.message : getReasonPhrase((err.status = 500)),
    });
  }
  return res.status(500).send(getReasonPhrase((err.status = 500)));
};
