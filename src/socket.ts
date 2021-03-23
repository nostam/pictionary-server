import socketio, { Socket } from "socket.io";
import { Server } from "http";
import logger from "./shared/Logger";
import RoomModal from "./models/rooms";

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
        const roomData = { room: "", users: [] };
        socket.to(data.room).emit("roomData", roomData);
      } catch (error) {
        logger.err(error);
      }
    });
    socket.on("disconnect", async (data) => {
      const room = await RoomModal.findById(data._id);
      if (room) {
        room.users!.filter((user) => user.socketId !== socket.id);
        const res = await RoomModal.findByIdAndUpdate(data._id, room);
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
    socket.on("canvasData", async (dataURL) => {
      logger.info(dataURL.length);
      socket.in("test").broadcast.emit("canvasData", dataURL);
    });
    socket.on("message", async (data) => {
      // const entry = await RoomModal.findById(data.room);
      console.log(data);
      socket.to(data.room).emit("message", data);
      const entry = { words: ["Smile", "star"] };
      const ans = entry!.words![data.round];
      if (data.message.split(" ")[0].toLowerCase() === ans.toLowerCase()) {
        socket.to(data.room).emit("message", {
          message: `Correct answers is ${ans}!`,
          from: "SYSTEM",
          round: data.round,
          room: data.room,
        });
      }
    });
  });
}
