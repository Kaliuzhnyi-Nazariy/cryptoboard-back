import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const { PORT, DB_HOST } = process.env;

mongoose
  .connect(DB_HOST as string)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend is running on port ${PORT}!`);
    });
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });
