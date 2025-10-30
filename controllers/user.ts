import { Request, Response } from "express-serve-static-core";
import { ctrlWrapper, postPhoto } from "../helper";
import { IUser, UpdUser, UserRequest } from "../types/user";
import { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user";
import Wallet from "../models/wallet";
import Transaction from "../models/transaction";

const getMe = (req: UserRequest, res: Response) => {
  const data = req.user;

  if (!data) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email, name, avatar, createdAt, tokens } = data;

  res.status(200).json({ email, name, avatar, createdAt, tokens });
};

const updateUser = async (req: Request, res: Response) => {
  const {
    id,
    email: userEmail,
    avatar: userAvatar,
  } = (req as unknown as UserRequest).user!;

  // console.log(id, userEmail, userAvatar);

  const user = await User.findById<IUser>(id);

  if (!user) return res.status(404).json({ message: "User not found!" });

  const { email, name, password } = req.body;
  const avatar = req.file;
  // console.log({ email, name, password, avatar });
  // console.log(user);

  if (userEmail !== email) {
    const isUpdUser = await User.findOne({ email }).select("-password");

    if (isUpdUser)
      return res.status(409).json({ message: "This email is already in use!" });
  }

  const isPasswordMatch = bcrypt.compare(password, user.password);

  let hashedPassword = user.password;

  if (!isPasswordMatch) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  let avatarRes = userAvatar;

  // console.log({ hashedPassword });

  // console.log(avatarRes);
  // console.log("======================");

  // console.log(avatar);

  // console.log("--------------------------");
  // console.log(avatar?.originalname.includes(avatarRes.name));
  // console.log(avatar?.originalname);

  if (avatar && !avatar?.originalname.includes(avatarRes.name)) {
    // console.log("change");
    // avatarRes = await postPhoto(
    //   avatar as Express.Multer.File,
    //   avatar?.originalname
    // );
    console.log(
      await postPhoto(avatar as Express.Multer.File, avatar?.originalname)
    );
  }

  // console.log({ avatarRes });

  const updUser = await User.findByIdAndUpdate(
    id,
    {
      email,
      name,
      password: hashedPassword,
      // avatar: {
      //   link: avatarRes.link || avatarRes.secure_url || "",
      //   name: avatarRes.name || avatarRes.original_filename || "",
      // },
      avatar: {
        link: avatarRes.link || "",
        name: avatarRes.name || "",
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(updUser);
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };

  const isUser = await User.findById(id);

  if (!isUser) return res.status(200).json({ message: "User not found!" });

  const deleteUser = await User.findByIdAndDelete(id).select("-password");

  await Wallet.findOneAndDelete({ owner: id });

  await Transaction.deleteMany({ author: id });

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(deleteUser);
};

const getTokens = async (req: Request, res: Response) => {
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };
  const user = await User.findById(id);

  if (!user) return res.status(404).json({ message: "User not found!" });

  return res.status(200).json({ tokens: user.tokens });
};

export default {
  getMe: ctrlWrapper(getMe as any),
  updateUser: ctrlWrapper(updateUser),
  deleteUser: ctrlWrapper(deleteUser),
  getTokens: ctrlWrapper(getTokens),
};
