const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let isConnected = false;

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/savoria';
    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000
        });
        isConnected = true;
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (${conn.connection.name})`);
    } catch (err) {
        isConnected = false;
        console.log(`⚠️  MongoDB connection notice: ${err.message}`);
        console.log(`🛡️  Activating Savoria Built-in Persistent JSON Storage (Zero Downtime Mode)`);
        console.log(`💡 To connect to MongoDB Atlas, add your connection string to .env (MONGO_URI)`);
    }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
