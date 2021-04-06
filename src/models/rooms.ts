import { Schema, model } from "mongoose";
import { IRoom } from "../shared/interfaces";

export const RoomSchema = new Schema<IRoom>(
  {
    creator: String,
    users: [
      {
        socketId: { type: String, required: true },
        _id: { type: Schema.Types.ObjectId },
        username: { type: String },
        avatar: { type: String },
      },
    ],
    draw: [{ users: [{ type: String }], round: Number }],
    guess: [{ users: [{ type: String }], round: Number }],
    endedAt: Date,
    words: [String],
    difficulty: String,
    mode: String,
    status: { type: String, default: "waiting" },
    round: { type: Number, default: 0 },
    canvas: String,
  },
  { timestamps: true }
);

const RoomModal = model("rooms", RoomSchema);

export default RoomModal;
