import express from "express";
import cors from "cors";
import authRoute from "./route/auth";
import userRoute from "./route/user";
import walletRoute from "./route/wallet";
import transactionRoute from "./route/transaction";
import bodyParser from "body-parser";

const app = express();

app.use(
  cors({
    origin: ["https://cryptoboard-unor.onrender.com", "http://localhost:3000"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders:
      "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe",
  })
);

app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// app.options("*", cors());

app.use("/api/auth", authRoute);

app.use("/api/user", userRoute);

app.use("/api/wallet", walletRoute);

app.use("/api/transaction", transactionRoute);

export default app;
