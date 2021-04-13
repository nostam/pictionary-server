import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import passport from "passport";
import { createServer } from "http";

import BaseRouter from "./services";
import { loggerMiddleware, httpErrorHandler, env } from "./shared/functions";
import logger from "./shared/Logger";
import SocketServer from "./socket";

const app = express();
const port = Number(process.env.PORT || 3001);
const httpServer = createServer(app);
SocketServer(httpServer);

env("TZ");

app.use(helmet());
app.use(cors({ credentials: true, origin: process.env.FE_URL_PROD }));
app.use(express.json());

app.use(cookieParser());
app.use(passport.initialize());

app.use(loggerMiddleware);
app.use("/", BaseRouter);
app.use(httpErrorHandler);

mongoose
  .connect(env("MONGODB"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() =>
    httpServer.listen(port, () => {
      logger.info("Running on port: " + port);
    })
  )
  .catch((err: Error) => logger.err(err));
