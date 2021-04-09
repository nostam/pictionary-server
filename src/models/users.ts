import { Schema, model, Model } from "mongoose";
import bcrypt from "bcryptjs";
const { defaultAvatar } = require("../shared/users");
import { IUser } from "../shared/interfaces";

interface IUserModel extends Model<IUser> {
  findByCredentials(username: string, password: string): IUser;
}

export const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, lowercase: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    password: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      validate: {
        validator: async function (email: string | undefined) {
          const user = await UserModel.findOne({ email }); //this.constructor
          if (user && user.email === email) return true;
          return !user ? true : false;
        },
        message: "email is taken",
      },
    },
    avatar: String,
    status: { type: String },
    desciption: { type: String, maxLength: 280 },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    googleId: String,
    socketId: String,
    refreshTokens: [{ token: { type: String } }],
    point: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (
  username: string,
  password: string
) {
  const user = await this.findOne({ username });
  if (user && user.password) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password!;
  if (user.avatar === undefined)
    if (user.isModified("password")) {
      user.avatar = defaultAvatar(user.username);
      user.password = await bcrypt.hash(plainPW, 10);
    }
  next();
});

const UserModel = model<IUser, IUserModel>("users", UserSchema);

export default UserModel;
