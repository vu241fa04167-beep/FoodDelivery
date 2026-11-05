import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://%2Ftmp%2Fmongodb-27017.sock/savor';
  try {
    const conn = await mongoose.connect(uri);
    console.log('MongoDB connected');
    return conn;
  } catch (err) {
    if (uri.includes('127.0.0.1')) {
      const socketUri = 'mongodb://%2Ftmp%2Fmongodb-27017.sock/savor';
      console.log(`TCP connection failed, attempting Unix socket fallback: ${socketUri}`);
      const conn = await mongoose.connect(socketUri);
      console.log('MongoDB connected via fallback Unix socket');
      return conn;
    }
    throw err;
  }
};

