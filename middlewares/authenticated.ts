import { NextFunction, Request, Response } from "express-serve-static-core";
import { IUser, UserRequest } from "../types/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import mongoose from "mongoose";

const { SECRET_JWT } = process.env;

// const isAuthenticated = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let token;

//   token = req.headers.cookie
//     ?.split("; ")
//     .filter((cook) => cook.includes("token="))[0]
//     .split("=")[1];

//   // console.log({ token });

//   const authorization = token;

//   if (!authorization) {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       path: "/",
//       maxAge: 1 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(401).json({ message: "Unauthorized!" });
//   }

//   // console.log({ authorization });

//   try {
//     const { id } = jwt.verify(
//       authorization,
//       SECRET_JWT as string
//     ) as unknown as {
//       id: string;
//     };

//     // console.log({ id });

//     const user = await User.findById<IUser>(id).select("-password");

//     // console.log({ user });

//     if (!user) {
//       res.clearCookie("token", {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//         path: "/",
//         maxAge: 1 * 24 * 60 * 60 * 1000,
//       });

//       return res.status(401).json({ message: "Unauthorized! !user" });
//     }

//     (req as unknown as UserRequest).user = user;

//     const payload = {
//       id,
//     };

//     // const newToken = jwt.sign(payload, SECRET_JWT as string, {
//     //   expiresIn: "24h",
//     // });

//     // console.log({ newToken });

//     // await User.findByIdAndUpdate(id, { token: newToken });

//     // res.cookie("token", newToken, {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === "production",
//     //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     //   path: "/",
//     //   maxAge: 1 * 24 * 60 * 60 * 1000,
//     // });
//     // .send();

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

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
    const authorization = req.headers["authorization"]?.split(" ")[1];

    token = authorization;
  }

  if (!token) res.status(401).json({ message: "Unauthorized!" });

  try {
    // const { id } = jwt.verify(
    //   String(token),
    //   SECRET_JWT as string
    // ) as unknown as {
    //   id: string;
    // };

    // const { id } = jwt.verify(
    //   String(token),
    //   SECRET_JWT as string
    // ) as unknown as {
    //   id: string;
    // };

    let userId;

    try {
      const { id } = jwt.verify(
        String(token),
        SECRET_JWT as string
      ) as unknown as {
        id: mongoose.ObjectId;
      };

      userId = id;
    } catch (error) {
      // console.log("error in jwt.verify: ", error);
      res.setHeader("authorization", "");
      return res.status(401).json({ message: "Time run out!" });
    }

    const user = await User.findById<IUser>(userId).select("-password");

    // console.log({ user });

    if (!user) {
      // res.clearCookie("token", {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      //   path: "/",
      //   maxAge: 1 * 24 * 60 * 60 * 1000,
      // });

      return res.status(401).json({ message: "Unauthorized! !user" });
    }

    (req as unknown as UserRequest).user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default isAuthenticated;
