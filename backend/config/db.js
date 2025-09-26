import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined
  });
  return mongoose.connection;
}


