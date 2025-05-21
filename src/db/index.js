import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import { apiError } from '../utils/apiError.js';

const dbConnection = async () => {
    try {
        const connectionResponse = await mongoose.connect(
            `${process.env.DB_URI}/${DB_NAME}`
        );
        console.log(
            `Database connection successful! Host: ${connectionResponse.connection.host}`
        );
    } catch (error) {
        // Log the error before throwing
        console.error('Database connection failed:', error);
        // Throw a formatted API error
        throw new apiError(error.statusCode || 500, error.message || 'Database connection error');
    }
};

export default dbConnection;