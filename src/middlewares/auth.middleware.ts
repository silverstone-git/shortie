import { NextFunction, Request, Response } from "express";
import 'dotenv/config';
import { getSession } from "@auth/express";
import Google from "@auth/express/providers/google"


export const authSession = async (req: Request, res: Response, next: NextFunction) => {
  res.locals.session = await getSession(req, {providers: [Google]})
  next();
}

export const authenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = res.locals.session ?? (await getSession(req, {providers: [
    Google
  ]}))
  if (!session?.user) {
    res.redirect("/login")
  } else {
    next()
  }
}
