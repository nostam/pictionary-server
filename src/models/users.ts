import { Schema, model, Model } from "mongoose";
import bcrypt from "bcryptjs";
// const { defaultAvatar } = require("../../utils/users");
import { IUser, IResUser } from "../shared/interfaces";

interface IUserModel extends Model<IUser> {
  findByCredentials(username: string, password: string): IUser;
}

export const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, lowercase: true },
    firstName: { type: String },
    lastName: { type: String },
    password: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      validate: {
        validator: async function (email: string) {
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
  },
  { timestamps: true }
);

UserSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.methods.toJSON = function () {
  const user: IResUser = this;
  const userObject = user.toObject();
  //   function del(userObject: IResUser) {
  //     delete userObject.password;
  //     delete userObject.__v;
  //     delete userObject.refreshTokens;
  //   }
  //   del(userObject);
  return userObject as IResUser;
};

UserSchema.statics.findByCredentials = async function (
  username: string,
  password: string
) {
  const user = await this.findOne({ username });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;
  if (user.avatar === undefined)
    if (user.isModified("password")) {
      // user.avatar = defaultAvatar(user.firstName, user.lastName);
      user.password = await bcrypt.hash(plainPW, 10);
    }
  next();
});

const UserModel = model<IUser, IUserModel>("users", UserSchema);

export default UserModel;
