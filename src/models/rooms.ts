import { Schema, model } from "mongoose";
import { IRoom } from "../shared/constants";

export const RoomSchema = new Schema<IRoom>(
  {
    creator: String,
    users: [{ type: Schema.Types.ObjectId, ref: "users" }],
    startedAt: Date,
    endedAt: Date,
    words: ["star", "smile"], //TODO update wordlist
    difficulty: String,
    mode: String,
  },
  { timestamps: true }
);

const RoomsModal = model("rooms", RoomSchema);

export default RoomsModal;
