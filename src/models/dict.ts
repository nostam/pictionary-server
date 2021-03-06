import { Schema, model } from "mongoose";
import { IDict } from "../shared/interfaces";

export const DictSchema = new Schema<IDict>({
  difficulty: String,
  words: [String],
});

const DictModal = model("dicts", DictSchema);

export default DictModal;
