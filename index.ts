import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import router from "./src/router/index.js"; // ¡Agregar .js!
import environment from "./src/config/index.js"; // ¡Agregar .js!
import helmet from "helmet";
import limiter from "./src/lib/express_rate_limit.js"; // ¡Agregar .js!
import {connectToDatabase} from "./src/database/mongoose.js"; // ¡Agregar .js!
import {logger} from "./src/lib/winston.js"; // ¡Agregar .js!
import {errorHandler, notFoundHandler} from "./src/middlewares/errorHandler.js"; // ¡Agregar .js!

const app = express();

app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(helmet());
app.use(limiter);
app.use('/api', router()); // Cambiar de '/' a '/api'
app.use(notFoundHandler);
app.use(errorHandler);

// Inicialización de base de datos (solo una vez)
let dbConnected = false;

const initializeApp = async () => {
    if (!dbConnected) {
        try {
            await connectToDatabase();
            dbConnected = true;
            logger.info("Database connected successfully");
        } catch (e) {
            logger.error("Error connecting to database", e);
        }
    }
};

// Para desarrollo local
if (process.env.VERCEL !== '1') {
    (async () => {
        try {
            await initializeApp();

            const server = http.createServer(app);

            server.listen(environment.PORT, () => {
                logger.info(`Server is running on port:${environment.PORT}`);
            });

        } catch (e) {
            logger.error("Error starting server", e);
        }
    })();
}

// Para Vercel (exportar la app)
export default async (req: any, res: any) => {
    await initializeApp();
    return app(req, res);
};