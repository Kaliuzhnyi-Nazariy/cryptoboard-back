import mongoose, { model, Schema } from "mongoose";
import { mongooseHelper } from "../helper";

const transactionSchema = new Schema(
  {
    transaction: {
      type: String,
      required: true,
      enum: ["buy", "sell", "topup", "withdraw"],
    },
    author: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    moneyAmount: { type: Number, required: true },
    // amount: { type: Number, required: true },
  },
  { timestamps: true }
);

(transactionSchema as any).post("save", mongooseHelper);

const Transaction = model("transaction", transactionSchema);

export default Transaction;
