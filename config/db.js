const dns = require('dns');
const mongoose = require('mongoose');

// Use public DNS servers for MongoDB SRV lookup
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it in your .env file.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);

  console.log('✅ MongoDB connected');
}

module.exports = connectDB;