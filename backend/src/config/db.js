import mongoose from 'mongoose';

let isConnected = false;
let isMockMode = false;

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('⚠️ No MONGODB_URI environment variable found. Falling back to in-memory Mock DB mode.');
    isMockMode = true;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000, // Fail quickly if MongoDB is offline
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️ Falling back to in-memory Mock DB mode due to connection failure.');
    isMockMode = true;
  }
}

export function getDBStatus() {
  return {
    connected: isConnected,
    mockMode: isMockMode,
  };
}
