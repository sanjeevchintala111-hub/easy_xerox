const dns = require('dns');
const mongoose = require('mongoose');

// Use reliable public DNS servers for MongoDB Atlas SRV lookup
dns.setServers(['8.8.8.8', '1.1.1.1']);

let connectionPromise = null;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      'MONGO_URI is missing. Add MONGO_URI to your environment variables.'
    );
  }

  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection already in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.set('strictQuery', true);

  connectionPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((mongooseInstance) => {
      console.log('✅ MongoDB connected');
      return mongooseInstance.connection;
    })
    .catch((error) => {
      console.error('❌ MongoDB connection failed:', error);
      // Allow another request to try connecting again
      connectionPromise = null;

      throw error;
    });

  return connectionPromise;
}

module.exports = connectDB;