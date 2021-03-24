import { Router } from "express";
import RoomModal from "../models/rooms";
import { APIError } from "../shared/classes";
import logger from "../shared/Logger";

const router = Router();

router.post("/create", async (req, res, next) => {
  try {
    const newRoom = new RoomModal({ ...req.body, status: "waiting" });
    const data = await newRoom.save();
    res.status(201).send(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const room = await RoomModal.findById(req.params.id);
    if (room!.status !== "waiting") res.status(404).send();
  } catch (error) {
    logger.err(error);
    res.status(404).send();
  }
});

router.get("/", async (req, res, next) => {
  try {
    const roomList = await RoomModal.find({
      status: "waiting",
      createdAt: { $gte: new Date().getTime() - 1000 * 60 * 60 },
    });
    res.send(roomList);
  } catch (error) {
    next(error);
  }
});

export default router;
