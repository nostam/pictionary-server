import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { getReasonPhrase } from "http-status-codes";

import { IErrMsg } from "./constants";

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
  res
) => {
  console.log(err);
  if (!res.headersSent) {
    if (err.httpStatusCode === undefined) err.httpStatusCode = 500;
    res.status(err.httpStatusCode).send({
      error: err.error ? err.error : getReasonPhrase(err.httpStatusCode),
    });
  }
};
