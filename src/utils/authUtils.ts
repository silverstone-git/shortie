//import { ExpressAuthConfig } from "@auth/express";
//import { IUser } from "../models/user";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import Google from "@auth/express/providers/google";
//import { Redis } from "@upstash/redis";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoClient from "./mongodb.ts";

//const redis = new Redis({
//  url: process.env.UPSTASH_REDIS_URL,
//  token: process.env.UPSTASH_REDIS_TOKEN,
//})

export const authOptions: any = {
  providers: [
    Google
  ],
  adapter: MongoDBAdapter(mongoClient)
}
