import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import 'dotenv/config';

export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {

    console.log("in auth middleware cookies are : ", req.cookies?.token)
    console.log("in auth middleware headers are : ", req.header('Authorization'))
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      throw new ApiError(401, "No token, authorization denied");
    }

    const decodedToken = jwt.verify(token, process.env?.ACCESS_TOKEN_SECRET ?? '');
    if (!decodedToken) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = decodedToken; // Attach the decoded token to the request object
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Unauthorized request");
  }
});
