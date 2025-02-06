import { NextFunction, Request, Response } from "express";
import 'dotenv/config';
import { getSession } from "@auth/express";
import { authOptions } from "../utils/authUtils";


export const authSession = async (req: Request, res: Response, next: NextFunction) => {
  res.locals.session = await getSession(req, authOptions)
  next();
}

export const authenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = res.locals.session ?? (await getSession(req, authOptions))
  if (!session?.user) {
    res.redirect("/login")
  } else {
    next()
  }
}
