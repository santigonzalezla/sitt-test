import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import router from "../src/router/index";
import helmet from "helmet";
import limiter from "../src/lib/express_rate_limit";
import {connectToDatabase} from "../src/database/mongoose";
import {logger} from "../src/lib/winston";
import {errorHandler, notFoundHandler} from "../src/middlewares/errorHandler";

const app = express();

app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(helmet());
app.use(limiter);
app.use('/', router());
app.use(notFoundHandler);
app.use(errorHandler);

// Conectar a la base de datos una vez
let isConnected = false;

const connectDB = async () => {
    if (!isConnected) {
        await connectToDatabase();
        isConnected = true;
        logger.info('Database connected for serverless function');
    }
};

// Export para Vercel
export default async (req: any, res: any) => {
    await connectDB();
    app(req, res);
};