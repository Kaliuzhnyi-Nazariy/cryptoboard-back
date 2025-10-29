import { Schema, model } from "mongoose";
import { mongooseHelper } from "../helper";

const userSchema = new Schema(
  {
    email: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    password: { type: String, require: [true, "Setting password is obvious!"] },
    token: { type: String || null, default: null },
    avatar: { link: { type: String }, name: { type: String } },
    // avatar: { type: String },
    tokens: {
      type: [
        {
          name: { type: String, required: true },
          purchases: {
            type: [
              {
                price: { type: Number, required: true },
                amount: { type: Number, required: true },
              },
            ],
          },
        },
      ],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

//I have an idea to make sth as in xtb, when I bought shares can I see all of them by clicking on shares in my storage and see each purchase, how much share costed and how many shares I've bought.

(userSchema as any).post("save", mongooseHelper);

const User = model("user", userSchema);

export default User;
