import dbConnection from "./db/index.js";
import dotenv from 'dotenv';
import { app } from "./app.js";

const PORT = process.env.PORT || 7070;

dotenv.config({
    path: './env'
});

dbConnection()
.then((res) => {
    console.log(res);
    app.listen(PORT, () => console.log(`⚪Server Listening on port: ${PORT}`));
    app.on('error', (error) => {
        throw error;
    });
})
.catch((err) => {
    console.log(`Database Connection Denied ${err}`);
})