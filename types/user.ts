import mongoose from "mongoose";

export interface IUser {
  id: mongoose.ObjectId | mongoose.Types.ObjectId;
  email: string;
  name: string;
  token: string | null;
  listOfFav?: number[];
  password: string;
  avatar: {
    link: string;
    name: string;
  };
  tokens: Token[];
  [x: string]: any;
}

export interface SignUpUser extends IUser {
  password: string;
  confirmPassword: string;
}

export interface SignInUser {
  email: string;
  password: string;
}

export interface UserRequest extends Request {
  user: IUser | null;
}

// export type UpdUser = Pick<IUser, "email" | "name" | "password">;
export type UpdUser = {
  email: string;
  name: string;
  password: string;
  avatar: string | File;
};

type Purchase = {
  price: Number;
  amount: Number;
};
export interface Token {
  name: string;
  purchases: Purchase[];
}
