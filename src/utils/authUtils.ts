import { ExpressAuthConfig } from "@auth/express";
//import { IUser } from "../models/user";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import Google from "@auth/express/providers/google";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})

export const authOptions: ExpressAuthConfig = {
  providers: [
    Google
  ],
  adapter: UpstashRedisAdapter(redis)
}
