import socketio, { Socket } from "socket.io";
import { Server } from "http";
import { Express } from "express";
import logger from "./shared/Logger";

export default function SocketServer(server: Server) {
  const io = socketio(server);
  io.on("connection", (socket: Socket) => {
    logger.info("connection established: " + socket.id);
  });
}
