import socketio, { Socket } from "socket.io";
import { Server } from "http";
import logger from "./shared/Logger";

export default function SocketServer(server: Server) {
  const io = socketio(server);
  io.on("connection", (socket: Socket) => {
    logger.imp("connection established: " + socket.id);
    socket.on("joinRoom", async (data) => {
      try {
        socket.join(data.room);
        logger.info(`${socket.id} joined ${data.room}`);
        const msgToRoomMembers = {};
        socket.broadcast.to(data.room).emit("message", msgToRoomMembers);
        const roomData = { room: "", users: [] };
        io.to(data.room).emit("roomData", roomData);
      } catch (error) {
        logger.err(error);
      }
    });
  });
}
