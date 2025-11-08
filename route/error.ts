import { NextFunction, Request, Response } from "express-serve-static-core";

interface CustomError extends Error {
  status: number;
}

export const errorRoute = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Server error!";

    return res.status(status).json({ message });
  }

