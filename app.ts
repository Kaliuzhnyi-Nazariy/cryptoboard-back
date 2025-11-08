import express from "express";
import cors from "cors";
import authRoute from "./route/auth";
import userRoute from "./route/user";
import walletRoute from "./route/wallet";
import transactionRoute from "./route/transaction";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { errorRoute } from "./route/error";

const app = express();

app.use(
  cors({
    origin: [
      "https://cryptoboard-rho.vercel.app",
      "https://cryptoboard-24p1ggjw5-nazariis-projects-5a199c42.vercel.app",
      "https://cryptoboard-unor.onrender.com",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders:
      "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe",
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cookieParser());

app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// app.options("*", cors());

app.use("/api/auth", authRoute);

app.use("/api/user", userRoute);

app.use("/api/wallet", walletRoute);

app.use("/api/transaction", transactionRoute);

app.use(errorRoute);

export default app;
