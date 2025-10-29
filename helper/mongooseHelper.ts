import { NextFunction } from "express-serve-static-core";

const mongooseHelper = (
  error: { code: number; name: string; status?: number },
  data: unknown,
  next: NextFunction
) => {
  const { code, name } = error;
  const status = name === "MongoServerError" && code === 11000 ? 409 : 400;
  error.status = status;
  next();
};

// module.exports = mogooseHelper;
export default mongooseHelper;
