import { MongoClient } from "mongodb";
import * as Redis from 'redis';
import 'dotenv/config'

async function getDb(mongoClient: MongoClient) {
  try {
    // Option 1: Await the connection and then use the client:
    const connectedClient = await mongoClient.connect();
    return connectedClient.db('shortie');

  } catch (error) {
    console.error('Error starting server:', error);
  }
}

async function closeConnection(mongoClient: MongoClient) {
  console.log('Shutting down gracefully...');
  try {
    await mongoClient.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

const getCache: () => Promise<Redis.RedisClientType> = async () => {
  return Redis.createClient({
	// username: process.env?.REDIS_USERNAME,
	// password: process.env?.REDIS_PASSWORD,
	// socket: {
	// 	host: process.env?.REDIS_HOST,
	// 	port: Number(process.env?.REDIS_PORT)
	// }
	url: process.env?.REDIS_URL
  });
}

export default {getDb, getCache, closeConnection};
