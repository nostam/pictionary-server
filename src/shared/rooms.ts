import RoomModal from "../models/rooms";
import logger from "./Logger";
import { IPlayers } from "../shared/constants";

export async function removeUserFromRoom(room: string, sid: string) {
  try {
    const res = await RoomModal.findByIdAndUpdate(
      room,
      { $pull: { users: sid } },
      { new: true }
    );
    if (res) return res;
  } catch (error) {
    logger.err(error);
  }
}

export async function addUserToRoom(room: string, sid: string) {
  try {
    const res = await RoomModal.findByIdAndUpdate(
      room,
      {
        $push: { users: sid },
      },
      { new: true }
    );
    if (res) return res;
  } catch (error) {
    logger.err(error);
  }
}

export async function updateRoomStatus(room: string, status: string) {
  try {
    if (status !== "ended") {
      // init new game flow
      const old = await RoomModal.findById(room, { users: 1 });
      const { users } = old!;
      const draw: IPlayers[] = [];
      const guess: IPlayers[] = [];
      const minDraw = 1; //TODO mode
      const rand = (n = users!.length) => Math.floor(Math.random() * n);
      for (let i = 0; i < users.length + 2; i++) {
        const drawOnce: IPlayers = { round: i, users: [] };
        const guessOnce: IPlayers = { round: i, users: [] };

        if (draw.length > 0) {
          let prevDraw = guess[i - 1].users;
          for (let l = 0; l < minDraw; l++) {
            const lucky = prevDraw[rand(prevDraw.length)];
            drawOnce.users.push(lucky);
            prevDraw.filter((d) => d !== lucky);
          }
        } else drawOnce.users.push(users[rand()]);
        guessOnce.users = users.filter((u) => !drawOnce.users.includes(u));
        draw.push(drawOnce);
        guess.push(guessOnce);
      }
      console.log(draw, guess);
      const res = await RoomModal.findByIdAndUpdate(
        room,
        { status, draw, guess },
        { new: true }
      );
      if (res) return res;
    }
  } catch (error) {
    logger.err(error, true);
  }
}

export async function createNextRound(round: number, room: string) {
  try {
    const oldRoom = await RoomModal.findById(room);
    if (oldRoom!.status === "started") {
    }
  } catch (error) {
    logger.err(error);
  }
}
