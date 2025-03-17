//import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import Google from "@auth/express/providers/google";
//import { Redis } from "@upstash/redis";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoClient from "../utils/mongodb.js";
//const redis = new Redis({
//  url: process.env.UPSTASH_REDIS_URL,
//  token: process.env.UPSTASH_REDIS_TOKEN,
//})
const authOptions = {
    providers: [
        Google
    ],
    adapter: MongoDBAdapter(mongoClient)
};
export default { authOptions };
