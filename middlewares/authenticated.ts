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
  let token;

  token = req.headers.cookie
    ?.split("; ")
    .filter((cook) => cook.includes("token="))[0]
    .split("=")[1];

  if (!token) {
    console.log("set-cookie");
    console.log(req.headers["set-cookie"]);
    // token = req.headers['set-cookie']?.split('; ')
  }

  console.log({ token });

  const authorization = token;

  if (!authorization) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(401).json({ message: "Unauthorized!" });
  }

  console.log({ authorization });

  try {
    const { id } = jwt.verify(
      authorization,
      SECRET_JWT as string
    ) as unknown as {
      id: string;
    };

    console.log({ id });

    const user = await User.findById<IUser>(id).select("-password");

    console.log({ user });

    if (!authorization) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      return res.status(401).json({ message: "Unauthorized! !user" });
    }

    (req as unknown as UserRequest).user = user;

    const payload = {
      id,
    };

    const newToken = jwt.sign(payload, SECRET_JWT as string, {
      expiresIn: "24h",
    });

    console.log({ newToken });

    await User.findByIdAndUpdate(id, { token: newToken });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    // .send();

    next();
  } catch (error) {
    next(error);
  }
};

export default isAuthenticated;
