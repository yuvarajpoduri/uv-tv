import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, default: "uv" },
    avatarUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
