import { Router } from "express";
import UserRouter from "./users";
import RoomRouter from "./rooms";
// Init router and path
const router = Router();

// Add sub-routes
router.use("/users", UserRouter);
router.use("/rooms", RoomRouter);

// Export the base-router
export default router;
