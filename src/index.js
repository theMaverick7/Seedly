import dotenv from 'dotenv';
import dbConnection from './db/index.js';
import { app } from './app.js';

// Load environment variables
dotenv.config({ path: './env' });

const PORT = process.env.PORT || 7070;

async function startServer() {
    try {
        const res = await dbConnection();
        console.log(res);

        app.listen(PORT, () => {
            console.log(`⚙️  Server Listening on port: ${PORT}`);
        });

        app.on('error', (error) => {
            throw error;
        });
    } catch (err) {
        console.error(`Database Connection Denied: ${err}`);
        process.exit(1);
    }
}

startServer();