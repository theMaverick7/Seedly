import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.static(path.join(__dirname, 'productImages')));
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

// Routers
import farmownerRouter from './routes/farmowner.routes.js';
import userRouter from './routes/user.routes.js';
import farmRouter from './routes/farm.routes.js';
import productRouter from './routes/product.routes.js';

app.use('/api/v1/farmowner', farmownerRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/farms', farmRouter);
app.use('/api/v1/products', productRouter);

export { app };
