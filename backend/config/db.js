import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/quickbite';

  const tryConnect = async (uri) => mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    const conn = await tryConnect(primaryUri || localUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Never silently fall back to a local database in production. A deployed
    // service must fail loudly when its managed MongoDB credentials are wrong.
    if (process.env.NODE_ENV === 'production') {
      console.error('Production startup aborted: verify MONGODB_URI and network access.');
      process.exit(1);
    }
    if (primaryUri && primaryUri !== localUri) {
      try {
        const localConn = await tryConnect(localUri);
        console.log(`MongoDB Connected (local fallback): ${localConn.connection.host}`);
        return;
      } catch (_) {}
    }

    if (process.env.NODE_ENV === 'test') {
      process.exit(1);
    }

    console.warn('MongoDB connection failed. Will retry in 10 seconds (keeping server alive)...');
    setTimeout(connectDB, 10000);
  }
};

export default connectDB;
