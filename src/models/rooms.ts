import { Schema, model } from "mongoose";
import { IRoom } from "../shared/interfaces";

const embedUser = new Schema({
  socketId: { type: String, required: true },
  _id: { type: Schema.Types.ObjectId },
  username: { type: String },
  avatar: { type: String },
  point: { type: Number },
});

export const RoomSchema = new Schema<IRoom>(
  {
    creator: String,
    users: [embedUser],
    draw: [{ users: [embedUser], round: Number }],
    guess: [{ users: [embedUser], round: Number }],
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
