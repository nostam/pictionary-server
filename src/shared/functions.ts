import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

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
    res.status(err.httpStatusCode || StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: err.error ? err.error : getReasonPhrase(err.httpStatusCode),
    });
  }
};
