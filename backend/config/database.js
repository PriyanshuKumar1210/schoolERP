// const mongoose = require('mongoose');
// mongoose.set('strictPopulate', false);

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//     return conn;
//   } catch (error) {
//     console.error(`Error while connecting Database : ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');

mongoose.set('strictPopulate', false);

const connectDB = async () => {
  try {
    const {
      MONGODB_HOST = '127.0.0.1',
      MONGODB_PORT = '27017',
      MONGODB_DATABASE = 'scholerp',
      MONGODB_USERNAME,
      MONGODB_PASSWORD,
      MONGODB_AUTH_SOURCE = 'admin',
    } = process.env;

    // Validate required environment variables
    if (!MONGODB_USERNAME) {
      throw new Error('MONGODB_USERNAME is required');
    }

    if (!MONGODB_PASSWORD) {
      throw new Error('MONGODB_PASSWORD is required');
    }

    if (!MONGODB_DATABASE) {
      throw new Error('MONGODB_DATABASE is required');
    }

    // Encode credentials to safely handle special characters
    // such as @, #, $, %, :, /, ?, &, =
    const username = encodeURIComponent(MONGODB_USERNAME);
    const password = encodeURIComponent(MONGODB_PASSWORD);

    const mongoUri =
      `mongodb://${username}:${password}` +
      `@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}` +
      `?authSource=${encodeURIComponent(MONGODB_AUTH_SOURCE)}`;

    const conn = await mongoose.connect(mongoUri);

    console.log('=================================');
    console.log('MongoDB Connected Successfully');
    console.log(`Host     : ${conn.connection.host}`);
    console.log(`Database : ${conn.connection.name}`);
    console.log('=================================');

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;