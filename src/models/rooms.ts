import { Schema, model } from "mongoose";
import { IRoom } from "../shared/constants";

export const RoomSchema = new Schema<IRoom>(
  {
    creator: String,
    // users: [{ type: Schema.Types.ObjectId, ref: "users" }],
    users: [String],
    draw: [{ users: [{ type: String }], round: Number }],
    guess: [{ users: [{ type: String }], round: Number }],
    endedAt: Date,
    words: ["star", "smile"], //TODO update wordlist
    difficulty: String,
    mode: String,
    status: String,
    round: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const RoomModal = model("rooms", RoomSchema);

export default RoomModal;
