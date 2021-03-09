import express from "express";
import { Request, Response } from "express";
const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});
app.listen(PORT, () => {
  console.log(`running on ${PORT}`);
});
