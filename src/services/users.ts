import { Request, Response, Router } from "express";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  res.status(201).send("Hello Test");
});

export default router;
