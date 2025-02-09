import express from "express";
import 'dotenv/config';
import { getSession } from "@auth/express";
import authUtils from "@/utils/authUtils";


const authSession = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.locals.session = await getSession(req, authUtils.authOptions)
  next();
}

const authenticatedUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  //console.log("session checking..");
  //console.log(req.headers);
  //console.log(req.body);
  const session = res.locals.session ?? (await getSession(req, authUtils.authOptions))
  //console.log("session got..");
  //console.log(session);
  if (!session?.user) {
    console.log("User not logged in");
    res.redirect("/api/auth/signin")
  } else {
    console.log("going ahead");
    next()
  }
}

export default {authSession, authenticatedUser};
