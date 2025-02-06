import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import * as Redis from 'redis';

export async function getDb(mongoClient: MongoClient) {
  try {
    // Option 1: Await the connection and then use the client:
    const connectedClient = await mongoClient.connect();
    return connectedClient.db('shortie');

  } catch (error) {
    console.error('Error starting server:', error);
  }
}

export async function closeConnection(mongoClient: MongoClient) {
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

export async function getCache() {
  return Redis.createClient();
}
