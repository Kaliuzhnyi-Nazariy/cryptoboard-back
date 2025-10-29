import mongoose, { model, Schema } from "mongoose";
import { mongooseHelper } from "../helper";

const WalletSchema = new Schema({
  owner: { type: mongoose.Types.ObjectId || String, required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
});

(WalletSchema as any).post("save", mongooseHelper);

const Wallet = model("wallet", WalletSchema);

export default Wallet;
