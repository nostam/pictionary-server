import RoomModal from "../models/rooms";
import logger from "./Logger";
import { IPlayers, difficulty } from "../shared/interfaces";
import DictModal from "../models/dict";

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

export async function updateRoomStatus(
  room: string,
  status: string,
  difficulty: difficulty
) {
  try {
    if (status !== "ended") {
      // init new game flow
      const old = await RoomModal.findById(room, { users: 1 });
      const { users } = old!;
      const draw: IPlayers[] = [];
      const guess: IPlayers[] = [];
      const minDraw = 1; //TODO mode
      const roundTotal = users.length + 2;
      const rand = (n = users!.length) => Math.floor(Math.random() * n);
      for (let i = 0; i < roundTotal; i++) {
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

      let dict = await DictModal.findOne({ difficulty });
      const words: string[] = [];
      for (let i = 0; i < roundTotal; i++) {
        words.push(dict!.words[rand(dict!.words.length)]);
        dict!.words.filter((d) => d !== words[i]);
      }
      const res = await RoomModal.findByIdAndUpdate(
        room,
        { status, draw, guess, words },
        { new: true }
      );
      console.log(res);
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
