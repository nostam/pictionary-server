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
          message: `${socket.id} joined`,
          room: data.room,
        };
        socket.to(data.room).emit("message", msgToRoomMembers);
        const res = await RoomModal.findByIdAndUpdate(
          data.room,
          {
            $push: { users: socket.id }, //TODO
          },
          { new: true }
        );
        if (res) socket.to(data.room).emit("roomData", res);
      } catch (error) {
        logger.err(error);
      }
    });
    socket.on("leaveRoom", async (room: string) => {
      socket.to(room).emit("message", {
        from: "SYSTEM",
        message: `${socket.id} has left`,
        room,
      });
      const payload = await RoomModal.findByIdAndUpdate(
        room,
        { $pull: { users: socket.id } },
        { new: true }
      );
      if (payload) socket.to(room).emit("roomData", payload);
    });
    socket.on("disconnect", async (reason: string) => {
      logger.imp(`${socket.id}: ${reason}`);
    });
    socket.on("gameStatus", async (data) => {
      try {
        logger.info(`change status request: game ${data.status}`);
        const room = await RoomModal.findByIdAndUpdate(
          data.room,
          {
            status: data.status,
          },
          { new: true }
        );
        console.log(room!);
        if (room) socket.to(data.room).emit("roomData", room);
      } catch (error) {
        logger.err(error);
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
