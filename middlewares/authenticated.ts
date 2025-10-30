import { NextFunction, Request, Response } from "express-serve-static-core";
import { IUser, UserRequest } from "../types/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";

const { SECRET_JWT } = process.env;

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.cookie
    ?.split("; ")
    .filter((cook) => cook.includes("token="))[0]
    .split("=")[1];

  const authorization = token;

  if (!authorization) throw new Error("Unauthorized");

  console.log({ authorization });

  try {
    const { id } = jwt.verify(
      authorization,
      SECRET_JWT as string
    ) as unknown as {
      id: string;
    };
    const user = await User.findById<IUser>(id).select("-password");
    if (!user) return next(new Error("unauthorized"));

    (req as unknown as UserRequest).user = user;

    const payload = {
      id,
    };

    const newToken = jwt.sign(payload, SECRET_JWT as string, {
      expiresIn: "24h",
    });

    await User.findByIdAndUpdate(id, { token: newToken });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    next();
  } catch (error) {
    next(error);
  }
};

export default isAuthenticated;
