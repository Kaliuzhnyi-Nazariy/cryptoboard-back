import { Request, Response } from "express-serve-static-core";
import { UserRequest } from "../types/user";
import User from "../models/user";
import { JwtPayload } from "jsonwebtoken";
import Wallet from "../models/wallet";
import { ctrlWrapper } from "../helper";
import Transaction from "../models/transaction";

const getWallet = async (req: Request, res: Response) => {
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };
  // console.log("wallet getting");

  // console.log("id: ", id);
  // console.log({ id });

  const wallet = await Wallet.findOne({ owner: id });

  // console.log({ wallet });

  res.status(200).json(wallet);
  // res.status(200).json({});
};

const createWallet = async (req: Request, res: Response) => {
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };
  const user = await User.findById(id);

  if (!user) return res.status(404).json({ message: "User not found!" });

  const checkWallet = await Wallet.findOne({ owner: id });

  if (checkWallet)
    return res.status(409).json({ message: "Wallet is already exist!" });

  const { currency } = req.body;

  const newWallet = await Wallet.create({ owner: id, currency });

  res.status(201).json(newWallet);
};

const deleteWallet = async (req: Request, res: Response) => {
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };
  const user = await User.findById(id);

  if (!user) return res.status(404).json({ message: "User not found!" });

  const { walletId } = req.params;

  const newWallet = await Wallet.findByIdAndDelete(walletId);

  await Transaction.deleteMany({ author: id });

  res.status(204).json(newWallet);
};

const depositMoney = async (
  req: Request<{}, {}, { deposit: number }>,
  res: Response
) => {
  const { deposit } = req.body;
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };
  const wallet = await Wallet.findOne({ owner: id });

  if (!wallet)
    return res.status(404).json({ message: "Your wallet is not found!" });

  const newWalletValues = await Wallet.findByIdAndUpdate(
    wallet.id,
    { $inc: { balance: deposit } },
    { new: true }
  );

  res.status(200).json(newWalletValues);
};

const withdrawMoney = async (
  req: Request<{}, {}, { withdraw: number }>,
  res: Response
) => {
  const { withdraw } = req.body;
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };
  const wallet = await Wallet.findOne({ owner: id });

  if (!wallet)
    return res.status(404).json({ message: "Your wallet is not found!" });

  if (wallet.balance < withdraw)
    return res.status(400).json({ message: "Insufficient funds!" });

  const newWalletValues = await Wallet.findByIdAndUpdate(
    wallet.id,
    { $inc: { balance: -withdraw } },
    { new: true }
  );

  res.status(200).json(newWalletValues);
};

export default {
  createWallet: ctrlWrapper(createWallet),
  deleteWallet: ctrlWrapper(deleteWallet),
  getWallet: ctrlWrapper(getWallet),
  depositMoney: ctrlWrapper(depositMoney),
  withdrawMoney: ctrlWrapper(withdrawMoney),
};
