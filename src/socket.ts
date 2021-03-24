import socketio, { Socket } from "socket.io";
import { Server } from "http";
import logger from "./shared/Logger";
import RoomModal from "./models/rooms";
import { IRoomChat, ICanvas } from "./shared/constants";

export default function SocketServer(server: Server) {
  const io = socketio(server);
  io.on("connection", (socket: Socket) => {
    socket.to(socket.id).emit(socket.id);
    logger.imp("connection established: " + socket.id);
    socket.on("joinRoom", async (data) => {
      try {
        socket.join(data.room);
        logger.info(`${socket.id} joined ${data.room}`);
        const msgToRoomMembers = {
          from: "SYSTEM",
          message: `${socket.id} joined ${data.room}`,
          round: 0,
          room: data.room,
        };
        socket.to(data.room).emit("message", msgToRoomMembers);
        const res = await RoomModal.findByIdAndUpdate(
          data.room,
          {
            $push: { user: socket.id },
          },
          { new: true }
        );
        logger.info(res);
        socket.to(data.room).emit("roomData", res);
      } catch (error) {
        logger.err(error);
      }
    });
    socket.on("disconnect", async (data) => {
      logger.imp(`${socket.id}: ${data}`);
      if (data === "transport close") {
        const room = await RoomModal.findById(data._id);
        if (room) {
          room.users!.filter((user) => user.socketId !== socket.id);
          const res = await RoomModal.findByIdAndUpdate(data._id, room);
        }
      }
    });
    socket.on("canvasCoordinates", async (data) => {
      try {
        logger.info(data);
        socket.broadcast.emit("canvasCoordinates", data);
      } catch (error) {
        logger.err(error);
      }
    });
    socket.on("canvasData", async (data: ICanvas) => {
      //TODO mode
      logger.info(`Canvas size: ${data.dataURL.length}`);
      socket.in(data.room).broadcast.emit("canvasData", data);
    });
    socket.on("message", async (data: IRoomChat) => {
      const room = await RoomModal.findById(data.room);
      socket.to(data.room).emit("message", data);
      if (room && room.status === "ongoing") {
        const ans = room.words[data.round];
        if (data.message.split(" ")[0].toLowerCase() === ans.toLowerCase()) {
          socket.to(data.room).emit("message", {
            message: `Correct answers is ${ans}!`,
            from: "SYSTEM",
            round: data.round,
            room: data.room,
          });
        }
      }
    });
  });
}
