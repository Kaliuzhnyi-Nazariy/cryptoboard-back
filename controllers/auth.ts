import { Request, Response } from "express-serve-static-core";
import { IUser, SignInUser, SignUpUser, UserRequest } from "../types/user";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ctrlWrapper } from "../helper";
// import gravatar from "gravatar";

const { SECRET_JWT } = process.env;

const signUp = async (req: Request<{}, {}, SignUpUser>, res: Response) => {
  const { email, name, password, confirmPassword } = req.body;

  const isUser = await User.findOne({ email });

  if (isUser) {
    return res.status(409).json({ message: "This email is already in use!" });
  }

  // if (password !== confirmPassword) throw new Error("Passwords do not match!");

  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match!" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    email,
    name,
    password: hashedPassword,
  };

  const addNewUser = await User.create(newUser);

  if (!addNewUser) throw new Error("Sth went wrong during signing up");

  // const avatar = gravatar.url(email, {});

  const avatar = `https://www.gravatar.com/avatar/${email}?s=40px&d=mp`;

  const payload = {
    id: addNewUser.id,
  };

  const token = jwt.sign(payload, SECRET_JWT as string, {
    expiresIn: "23h",
  });

  const updUser = await User.findByIdAndUpdate(
    addNewUser.id,
    { token, avatar: { link: avatar } },
    { new: true }
  ).select("-password");

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json(updUser);
};

const signIn = async (req: Request<{}, {}, SignInUser>, res: Response) => {
  const { email, password } = req.body;

  const isUser = await User.findOne<IUser>({ email });

  if (!isUser) {
    return res.status(400).json({ message: "Email or password is wrong!" });
  }

  const isPasswordMatch = await bcrypt.compare(password, isUser.password);

  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Email or password is wrong!" });
  }

  const payload = {
    id: isUser.id,
  };

  const newToken = jwt.sign(payload, SECRET_JWT as string, {
    expiresIn: "23h",
  });

  const updUser = await User.findByIdAndUpdate(
    isUser.id,
    { token: newToken },
    { new: true }
  ).select("-password");

  // res.cookie("check", "check", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  //   path: "/",
  //   maxAge: 1 * 24 * 60 * 60 * 1000,
  // });

  res.cookie("token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  res
    .writeHead(200, {
      "set-cookie": "check=check; HttpOnly",
      "access-control-allow-credentials": "true",
      "access-control-max-age": "24*60*60*1000",
      SameSite: "none",
    })
    .send();

  return res
    .cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(updUser);
};

const signOut = async (req: Request, res: Response) => {
  const { id } = (req as unknown as UserRequest).user as unknown as {
    id: string;
  };

  const user = await User.findById(id);

  if (!user) throw new Error("user not found");

  const updUser = await User.findByIdAndUpdate(
    user.id,
    { token: "" },
    { new: true }
  ).select("-password");

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(updUser);
};

export default {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  signOut: ctrlWrapper(signOut),
};
