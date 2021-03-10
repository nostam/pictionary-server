import express from "express";
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
// const passport = require("passport");
const http = require("http");

const { loggerMiddleware, httpErrorHandler } = require("./shared/functions");
import logger from "./shared/Logger";
// const SocketServer = require("./socket");

const app = express();
const port = Number(process.env.PORT || 3001);
const httpServer = http.createServer(app);
// SocketServer(httpServer);

app.use(helmet());
app.use(cors({ credentials: true, origin: process.env.FE_URL_PROD }));
app.use(express.json());
app.use(cookieParser());
// app.use(passport.initialize());

app.use(loggerMiddleware);

app.use(httpErrorHandler);

mongoose
  .connect(
    process.env.MONGODB,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
    { autoIndex: false }
  )
  .then(() =>
    httpServer.listen(port, () => {
      logger.info("Running on port: " + port);
    })
  )
  .catch((err: Error) => logger.err(err));
