import socketio, { Socket } from "socket.io";
import { Server } from "http";
import logger from "./shared/Logger";
import RoomModal from "./models/rooms";
import { IRoomChat, ICanvas } from "./shared/constants";
import {
  addUserToRoom,
  removeUserFromRoom,
  updateRoomStatus,
} from "./shared/rooms";

export default function SocketServer(server: Server) {
  const io = socketio(server);

  io.on("connection", (socket: Socket) => {
    socket.to(socket.id).emit(socket.id);
    logger.imp("connection established: " + socket.id);
    socket.on("joinRoom", async (room) => {
      try {
        socket.join(room);
        logger.info(`${socket.id} joined ${room}`);
        const msgToRoomMembers = {
          from: "SYSTEM",
          message: `${socket.id} joined`,
          room,
        };
        socket.to(room).emit("message", msgToRoomMembers);
        const res = await addUserToRoom(room, socket.id);
        if (res) socket.in(room).emit("roomData", res);
      } catch (error) {
        logger.err(error);
      }
    });

    socket.on("leaveRoom", async (room: string) => {
      logger.imp(`${socket.id} left ${room}`);
      socket.in(room).emit("message", {
        from: "SYSTEM",
        message: `${socket.id} has left`,
        room,
      });
      const res = await removeUserFromRoom(room, socket.id);
      if (res) {
        socket.in(room).emit("roomData", res);
      }
    });

    socket.on("disconnect", async (reason: string) => {
      logger.imp(`${socket.id}: ${reason}`);
    });

    // game status events
    socket.on("gameStatus", async (data) => {
      try {
        logger.info(`change status request: game ${data.status}`);
        if (data.status !== "ended") {
          // from waiting to start
          const res = await updateRoomStatus(
            data.room,
            data.status,
            data.difficulty
          );

          if (res) io.in(data.room).emit("roomData", res);
        } else {
          // close game room
        }
      } catch (error) {
        logger.err(error);
      }
    });

    socket.on("nextRound", async (data) => {});

    socket.on("canvasCoordinates", async (data) => {
      try {
        logger.info(data);
        socket.broadcast.to(data.room).emit("canvasCoordinates", data);
      } catch (error) {
        logger.err(error);
      }
    });

    socket.on("canvasData", async (data: ICanvas) => {
      //TODO mode
      logger.info(`Canvas size: ${data.dataURL.length}`);
      socket.in(data.room).emit("canvasData", data);
    });

    socket.on("message", async (data: IRoomChat) => {
      const room = await RoomModal.findById(data.room);
      socket.to(data.room).emit("message", data);
      if (room && room.status === "ongoing") {
        const ans = room.words[data.round];
        if (data.message.split(" ")[0].toLowerCase() === ans.toLowerCase()) {
          socket.in(data.room).emit("message", {
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
