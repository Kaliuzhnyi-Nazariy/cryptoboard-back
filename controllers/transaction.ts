import { Request, Response } from "express-serve-static-core";
import { Token, UserRequest } from "../types/user";
import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import Transaction from "../models/transaction";
import { ctrlWrapper } from "../helper";
import Wallet from "../models/wallet";
import User from "../models/user";

export type Transaction = {
  // transaction?: "buy" | "sell" | "topup" | "withdraw";
  moneyAmount: number;
  // tokenSymbol?: string;
  tokenSymbol: string;
  tokenAmount: number;
  price?: number;
};

// const transaction = async (
//   req: Request<{}, {}, Transaction>,
//   res: Response
// ) => {
// const { amount, transaction, tokenSymbol, tokenAmount, price } = req.body;
// const { id } = (req as unknown as UserRequest).user as
//   | { id: string | mongoose.Types.ObjectId }
//   | JwtPayload;

//   // console.log({ amount, transaction, tokenSymbol, tokenAmount, price });

//   if (transaction === "buy" || transaction === "withdraw") {
// const walletBalance = await Wallet.findOne({ owner: id });

// if (walletBalance && walletBalance?.balance < amount)
//   throw new Error("Insuffucient funds!");
//   }

//   // if (transaction === "sell") {
//   //   console.log("sell triggered!");
//   //   return res.status(201).json({ message: "Sell " });
//   // }

//   if (transaction === "sell") {
//     // console.log("sell");
//     const userForTokens = await User.findById(id);

//     if (!userForTokens) throw new Error("user not found");

//     const userTokens = userForTokens.tokens;
//     const tokenIndex = userTokens.findIndex((t) => t.name == tokenSymbol);
//     const userPurchases = userTokens[tokenIndex].purchases;

//     // console.log("userData: ", userTokens[tokenIndex].purchases);

//     let sellAmount = amount;

//     for (let i = 0; i < userPurchases.length; i++) {
//       if (sellAmount >= userPurchases[i].amount) {
//         sellAmount -= userPurchases[i].amount;
//         console.log(userPurchases[i]._id);
//       } else {
//         userPurchases[i].amount -= sellAmount;
//         console.log("rest selling: ", userPurchases[i]._id);
//       }
//       // console.log(userPurchases[i].amount);
//     }
//   }

//   // const transactionData = await Transaction.create({
//   //   transaction,
//   //   amount,
//   //   author: id,
//   // });

//   // if (transaction === "buy" || transaction === "withdraw") {
// await Wallet.findOneAndUpdate(
//   { owner: id },
//   { $inc: { balance: -amount } },
//   { new: true }
// );
//   // } else {
//   //   await Wallet.findOneAndUpdate(
//   //     { owner: id },
//   //     { $inc: { balance: amount } },
//   //     { new: true }
//   //   );
//   // }

//   // const tokenData = {
//   //   name: tokenSymbol,
//   //   amount: tokenAmount,
//   //   price: price,
//   // };

//   // console.log({ tokenData });

// const user = await User.findById(id);

// if (!user) throw new Error("unauthorized");

// const isUserTokens = user.tokens.some((t) => t.name === tokenSymbol);

// if (isUserTokens) {
//   await User.findOneAndUpdate(
//     { _id: id, "tokens.name": tokenSymbol },
//     {
//       $push: {
//         "tokens.$.purchases": { price, amount: tokenAmount },
//       },
//     }
//   );
// } else {
//   await User.findByIdAndUpdate(
//     id,
//     {
//       $push: {
//         tokens: {
//           name: tokenSymbol,
//           purchases: { price: price, amount: tokenAmount },
//         },
//       },
//     },
//     { new: true }
//   );
// }

//   // console.log("user tokens and so on: ", user?.tokens);

//   // res.status(201).json(transactionData);
//   res.status(201).json({});
//   //   const customer = await stripe.cust;
// };

const buyTransaction = async (
  req: Request<{}, {}, Transaction>,
  res: Response
) => {
  const { moneyAmount, tokenSymbol, tokenAmount, price } = req.body;
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string | mongoose.Types.ObjectId;
  };

  const walletBalance = await Wallet.findOne({ owner: id });

  if (!walletBalance)
    return res.status(404).json({ message: "Wallet not found!" });

  if (!moneyAmount)
    return res.status(400).json({ message: "No money you sent!" });

  if (walletBalance && walletBalance?.balance < moneyAmount)
    return res.status(400).json({ message: "Insuffucient funds!" });

  const tokenBuyTransaction = await Transaction.create({
    transaction: "buy",
    moneyAmount,
    author: id,
  });

  if (!tokenBuyTransaction)
    return res.status(400).json({ message: "Sth went wrong!" });

  await Wallet.findOneAndUpdate(
    { owner: id },
    { $inc: { balance: -moneyAmount } },
    { new: true }
  );

  const user = await User.findById(id);

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const isUserTokens = user.tokens.some((t: Token) => t.name === tokenSymbol);

  if (isUserTokens) {
    await User.findOneAndUpdate(
      { _id: id, "tokens.name": tokenSymbol },
      {
        $push: {
          "tokens.$.purchases": { price, amount: tokenAmount },
        },
      }
    );
  } else {
    await User.findByIdAndUpdate(
      id,
      {
        $push: {
          tokens: {
            name: tokenSymbol,
            purchases: { price: price, amount: tokenAmount },
          },
        },
      },
      { new: true }
    );
  }

  res.status(201).json(tokenBuyTransaction);
};

const sellTransaction = async (
  req: Request<{}, {}, Transaction>,
  res: Response
) => {
  const { tokenSymbol, tokenAmount, moneyAmount } = req.body;
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string | mongoose.Types.ObjectId;
  };
  const user = await User.findById(id);

  if (!user) {
    return res.status(401).json({ message: "User not found!" });
  }

  const userWallet = await Wallet.findOne({ owner: id });

  if (!userWallet)
    return res.status(404).json({ message: "Wallet not found!" });

  const userTokens = user.tokens;
  const tokenIndex = userTokens.findIndex((t: Token) => t.name == tokenSymbol);
  const purchases = userTokens[tokenIndex].purchases;

  // check if there is enough token on user acc

  let allUserToken = 0;

  for (let i = 0; i < purchases.length; i++) {
    allUserToken += purchases[i].amount;
  }

  if (allUserToken < tokenAmount)
    return res.status(400).json({ message: "Insufficient tokens!" });

  // for loop for selling tokens

  let tokensToSell = tokenAmount;

  let idsToDelete = [];
  let idToModify;

  for (let i = 0; i < purchases.length; i++) {
    if (tokensToSell > 0) {
      if (tokensToSell < purchases[i].amount) {
        idToModify = purchases[i]._id;
        break;
      } else {
        tokensToSell -= purchases[i].amount;
        idsToDelete.push(purchases[i]._id);
        if (tokensToSell === 0) break;
      }
    }
  }

  //====================== sell tokens =======================//

  //delete field if amount is 0

  if (idsToDelete.length !== 0) {
    await User.findOneAndUpdate(
      { _id: id, "tokens.name": tokenSymbol },
      {
        $pull: {
          "tokens.$.purchases": { _id: { $in: idsToDelete } },
        },
      },
      { new: true }
    );
  }

  // modify exact token purcahse amount

  if (idToModify) {
    await User.findOneAndUpdate(
      { _id: id, "tokens.name": tokenSymbol },
      {
        $inc: {
          "tokens.$.purchases.$[purchase].amount": -tokensToSell,
        },
      },
      { arrayFilters: [{ "purchase._id": idToModify }], new: true }
    );
  }

  //===================create transaction=================//
  const sellTransaction = await Transaction.create({
    transaction: "sell",
    moneyAmount,
    author: id,
  });

  //===================add money to wallet====================//

  await Wallet.findOneAndUpdate(
    { owner: id },
    { $inc: { balance: moneyAmount } }
  );

  //==================== return data =======================//

  res.status(201).json(sellTransaction);
};

const topUpTransaction = async (
  req: Request<{}, {}, Transaction>,
  res: Response
) => {
  const { moneyAmount } = req.body;
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string | mongoose.Types.ObjectId;
  };
  const topupTransaction = await Transaction.create({
    transaction: "topup",
    moneyAmount,
    author: id,
  });

  if (!topupTransaction)
    return res.status(400).json({ message: "Sth went wrong!" });

  await Wallet.findOneAndUpdate(
    { owner: id },
    { $inc: { balance: moneyAmount } }
  );

  res.status(201).json(topupTransaction);
};

const withdrawTransaction = async (
  req: Request<{}, {}, Transaction>,
  res: Response
) => {
  const { moneyAmount } = req.body;

  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string | mongoose.Types.ObjectId;
  };

  const walletBalance = await Wallet.findOne({ owner: id });

  if (walletBalance && walletBalance?.balance < moneyAmount)
    return res.status(400).json({ message: "Insuffucient funds!" });

  const withdrawTransactionData = await Transaction.create({
    transaction: "withdraw",
    moneyAmount,
    author: id,
  });

  if (!withdrawTransactionData)
    return res.status(400).json({ message: "Sth went wrong!" });

  await Wallet.findOneAndUpdate(
    { owner: id },
    { $inc: { balance: -moneyAmount } }
  );

  res.status(201).json(withdrawTransactionData);
};

const getTransactions = async (
  req: Request<{}, {}, Transaction>,
  res: Response
) => {
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };

  const transactions = await Transaction.find({ author: id });

  res.status(200).json(transactions);
};

export default {
  // transaction: ctrlWrapper(transaction),
  buyTransaction: ctrlWrapper(buyTransaction),
  sellTransaction: ctrlWrapper(sellTransaction),
  topUpTransaction: ctrlWrapper(topUpTransaction),
  withdrawTransaction: ctrlWrapper(withdrawTransaction),
  getTransactions: ctrlWrapper(getTransactions),
};

// // const buyToken = async (req: Request<{}, {}, Transaction>, res: Response) => {
// //   const { amount } = req.body;
// //   const { id } = (req as unknown as UserRequest).user as
// //     | { id: string | mongoose.Types.ObjectId }
// //     | JwtPayload;

// //   const walletBalance = await Wallet.findOne({ owner: id });

// //   if (walletBalance && walletBalance?.balance < amount)
// //     throw new Error("Insuffucient funds!");

// //   const transactionData = await Transaction.create({
// //     transaction: "buy",
// //     amount,
// //     author: id,
// //   });

// //   await Wallet.findOneAndUpdate(
// //     { owner: id },
// //     { $inc: { balance: -amount } },
// //     { new: true }
// //   );

// //   res.status(201).json(transactionData);
// //   //   const customer = await stripe.cust;
// // };

// // const sellToken = async (req: Request<{}, {}, Transaction>, res: Response) => {
// //   const { amount } = req.body;
// //   const { id } = (req as unknown as UserRequest).user as
// //     | { id: string | mongoose.Types.ObjectId }
// //     | JwtPayload;

// //   const transactionData = await Transaction.create({
// //     transaction: "sell",
// //     amount,
// //     author: id,
// //   });

// //   await Wallet.findOneAndUpdate(
// //     { owner: id },
// //     { $inc: { balance: amount } },
// //     { new: true }
// //   );

// //   res.status(201).json(transactionData);
// //   //   const customer = await stripe.cust;
// // };

// // const topUp = async (req: Request<{}, {}, Transaction>, res: Response) => {
// //   const { amount } = req.body;
// //   const { id } = (req as unknown as UserRequest).user as
// //     | { id: string | mongoose.Types.ObjectId }
// //     | JwtPayload;

// //   const transactionData = await Transaction.create({
// //     transaction: "topup",
// //     amount,
// //     author: id,
// //   });

// //   await Wallet.findOneAndUpdate(
// //     { owner: id },
// //     { $inc: { balance: amount } },
// //     { new: true }
// //   );

// //   res.status(201).json(transactionData);
// //   //   const customer = await stripe.cust;
// // };

// // const withdraw = async (req: Request<{}, {}, Transaction>, res: Response) => {
// //   const { amount } = req.body;
// //   const { id } = (req as unknown as UserRequest).user as
// //     | { id: string | mongoose.Types.ObjectId }
// //     | JwtPayload;

// //   const newTransaction = {};

// //   const transactionData = await Transaction.create({
// //     transaction: "withdraw",
// //     amount,
// //     author: id,
// //   });

// //   await Wallet.findOneAndUpdate(
// //     { owner: id },
// //     { $inc: { balance: -amount } },
// //     { new: true }
// //   );

// //   res.status(201).json(transactionData);
// //   //   const customer = await stripe.cust;
// // };

// const transaction = async (
//   req: Request<{}, {}, Transaction>,
//   res: Response
// ) => {
//   const { amount, transaction } = req.body;
//   const { id } = (req as unknown as UserRequest).user as
//     | { id: string | mongoose.Types.ObjectId }
//     | JwtPayload;

//   if (transaction === "buy" || transaction === "withdraw") {
//     const walletBalance = await Wallet.findOne({ owner: id });

//     if (walletBalance && walletBalance?.balance < amount)
//       throw new Error("Insuffucient funds!");
//   }

//   const transactionData = await Transaction.create({
//     transaction,
//     amount,
//     author: id,
//   });

//   await Wallet.findOneAndUpdate(
//     { owner: id },
//     { $inc: { balance: -amount } },
//     { new: true }
//   );

//   res.status(201).json(transactionData);
//   //   const customer = await stripe.cust;
// };

// export default {
//   // buyToken: ctrlWrapper(buyToken),
//   // sellToken: ctrlWrapper(sellToken),
//   // topUp: ctrlWrapper(topUp),
//   // withdraw: ctrlWrapper(withdraw),
//   transaction: ctrlWrapper(transaction),
// };
