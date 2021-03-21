import { Request, Response, Router } from "express";
import RoomModal from "../models/rooms";
import { APIError } from "../shared/classes";
const router = Router();

router.post("/create", async (req, res, next) => {
  try {
    const newRoom = new RoomModal(req.body);
    const { _id } = await newRoom.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(new APIError(error));
  }
});

export default router;
