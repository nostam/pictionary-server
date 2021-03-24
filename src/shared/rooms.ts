import RoomModal from "../models/rooms";
import logger from "./Logger";

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
    const res = await RoomModal.findByIdAndUpdate(
      room,
      { status },
      { new: true }
    );
    if (res) return res;
  } catch (error) {
    logger.err(error);
  }
}
