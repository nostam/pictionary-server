import socketio, { Socket } from "socket.io";
import { Server } from "http";
import logger from "./shared/Logger";
import RoomModal from "./models/rooms";
import { IRoomChat, ICanvas, IRoomBell, IEmbedUser } from "./shared/interfaces";
import {
  addUserToRoom,
  removeUserFromRoom,
  updateRoomStatus,
  updateCanvas,
  addUsersPoints,
} from "./shared/rooms";

export default function SocketServer(server: Server) {
  const io = socketio(server);

  io.on("connection", (socket: Socket) => {
    socket.to(socket.id).emit(socket.id);
    logger.imp("connection established: " + socket.id);
    socket.on("joinRoom", async ({ room, user }: IRoomBell) => {
      try {
        socket.join(room);
        logger.info(`${user ? user.username : socket.id} joined ${room}`);
        const msgToRoomMembers = {
          from: "SYSTEM",
          message: `${user.username} has joined`,
          room,
        };
        socket.to(room).emit("message", msgToRoomMembers);

        const res = await addUserToRoom(room, socket.id, user);
        if (res) {
          socket.in(room).emit("roomData", res);
          io.to(socket.id).emit("canvasData", {
            from: "SYSTEM",
            room,
            dataURL: res.canvas,
          });
        }
      } catch (error) {
        logger.err(error, true);
      }
    });

    socket.on("leaveRoom", async ({ room, user }: IRoomBell) => {
      logger.imp(`${socket.id} left ${room}`);
      socket.in(room).emit("message", {
        from: "SYSTEM",
        message: `${user.username} has left`,
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
        const res = await updateRoomStatus(
          data.room,
          data.status,
          data.difficulty
        );

        if (data.status !== "ended" && res) {
          io.in(data.room).emit("roomData", res);
          io.in(data.room).emit("newCanvas", null);
        }
      } catch (error) {
        logger.err(error);
      }
    });

    socket.on("nextRound", async (data) => {
      logger.warn(`nextRound ${data.round}`);
      io.in(data.room).emit("newCanvas", null);
    });

    socket.on("newCanvas", async (room: string) => {
      io.in(room).emit("newCanvas", null);
      const res = await updateCanvas(room, undefined);
    });
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
      try {
        socket.in(data.room).emit("canvasData", data);
        const room = await updateCanvas(data.room, data.dataURL);
        if (room) logger.info(`Canvas size: ${data.dataURL.length}`);
      } catch (error) {
        logger.err(error);
      }
    });

    socket.on("message", async (data: IRoomChat) => {
      const room = await RoomModal.findById(data.room);
      socket.to(data.room).emit("message", data);
      if (room && room.status === "started") {
        const ans = room.words[data.round];
        if (data.message.split(" ")[0].toLowerCase() === ans.toLowerCase()) {
          io.in(data.room).emit("message", {
            message: `Correct answers is ${ans}!`,
            from: "SYSTEM",
            round: data.round,
            room: data.room,
          });
          if (room!.draw!.length !== data.round) {
            io.in(data.room).emit("nextRound", null);
            io.in(data.room).emit("newCanvas", null);
          } else {
            io.in(data.room).emit("roomData", { ...room, status: "ended" });
            const end = await updateRoomStatus(
              data.room,
              (status = "ended"),
              room.difficulty
            );
          }
          const res = await addUsersPoints(data.room, data.from, data.round);
        }
      }
    });
  });
}
