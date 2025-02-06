import express from "express";
import 'dotenv/config';
import { getSession } from "@auth/express";
import { authOptions } from "../utils/authUtils.ts";


export const authSession = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.locals.session = await getSession(req, authOptions)
  next();
}

export const authenticatedUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const session = res.locals.session ?? (await getSession(req, authOptions))
  if (!session?.user) {
    res.redirect("/login")
  } else {
    next()
  }
}
