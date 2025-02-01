import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js';

const dbConnection = async () => {
    try {
        const connectionResponse = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        console.log(`Database Connection made successfully! by host: ${connectionResponse.connection.host}`)
    } catch (error) {
        console.log(`Database Connection Error! => ${error}`)
        process.exit(1);
    }
}

export default dbConnection;