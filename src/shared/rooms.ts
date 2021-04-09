import Room from "../models/rooms";
import logger from "./Logger";
import { IPlayers, difficulty, IUser, IEmbedUser } from "./interfaces";
import User from "../models/users";
import DictModal from "../models/dict";

export async function removeUserFromRoom(room: string, sid: string) {
  try {
    const res = await Room.findByIdAndUpdate(
      room,
      { $pull: { users: { socketId: sid } } },
      { new: true }
    );
    if (res) return res;
  } catch (error) {
    logger.err(error);
  }
}

export async function addUserToRoom(room: string, sid: string, user?: IUser) {
  try {
    const res = await Room.findById(room);
    if (user && res) {
      const newPlayer: IEmbedUser = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar!,
        socketId: sid,
        point: 0,
      };
      console.log(res.users);
      const i = res.users.findIndex((u) => u._id === user._id);
      if (i < 0) res.users.push(newPlayer);
      else res.users[i] = { ...newPlayer };
      console.log(i, res.users);
      // res.users.push(newPlayer);
      res.save();
    } else {
      const newGuest: IEmbedUser = { socketId: sid, point: 0 };
      res!.users.push(newGuest);
      res!.save();
    }
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
    if (status === "ended") {
      const res = await Room.findByIdAndUpdate(room, { status }, { new: true });
      if (res) {
        const regUser = res.users.filter((u) => u._id !== undefined);
        for (let i = 0; i < regUser.length; i++) {
          await new Promise((resolve) => {
            User.addPoint(regUser[i]._id!, regUser[i].point!);
          });
        }
        return res;
      }
    }
    // init new game flow
    const old = await Room.findById(room, {
      users: 1,
      status: 1,
      point: 1,
    });

    if (status === "started" && old!.status === "waiting") {
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
      const res = await Room.findByIdAndUpdate(
        room,
        { status, draw, guess, words },
        { new: true }
      );
      console.log(res!.status, res!._id, res!.words, res!.users);
      if (res) return res;
    }
  } catch (error) {
    logger.err(error, true);
  }
}

// export async function createNextRound(round: number, room: string) {
//   try {
//     const oldRoom = await Room.findById(room);
//     if (oldRoom!.status === "started") {
//     }
//   } catch (error) {
//     logger.err(error);
//   }
// }

export async function updateCanvas(room: string, canvas: string | undefined) {
  try {
    const res = await Room.findByIdAndUpdate(
      room,
      {
        canvas: canvas,
      },
      { new: true }
    );
    if (res) return res;
  } catch (error) {
    logger.err(error);
  }
}

export async function addUsersPoints(
  room: string,
  ansId: string,
  round: number
) {
  const data = await Room.findById(room);
  const drawId = data!.draw![round].users[0].socketId;
  data!.users.map((u) => {
    if (u.socketId === ansId || u.socketId === drawId) {
      u["point"]! += 6;
    }
  });
  await data!.save();
}
