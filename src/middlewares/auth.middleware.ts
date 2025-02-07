import express from "express";
import 'dotenv/config';
import { getSession } from "@auth/express";
import { authOptions } from "@/utils/authUtils";


export const authSession = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.locals.session = await getSession(req, authOptions)
  next();
}

export const authenticatedUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  //console.log("session checking..");
  //console.log(req.headers);
  //console.log(req.body);
  const session = res.locals.session ?? (await getSession(req, authOptions))
  //console.log("session got..");
  //console.log(session);
  if (!session?.user) {
    res.redirect("/api/auth/signin")
  } else {
    next()
  }
}
