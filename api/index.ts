import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import router from '../src/router/index';
import limiter from '../src/lib/express_rate_limit';
import { connectToDatabase } from '../src/database/mongoose';
import { logger } from '../src/lib/winston';
import { errorHandler, notFoundHandler } from '../src/middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../src/swagger';

const app = express();

// Middlewares
app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));
app.use(limiter);

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SittTest API Documentation'
}));

// Routes
app.use('/', router());

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Conectar a la base de datos antes de manejar requests
let dbConnected = false;

const connectDB = async () => {
    if (!dbConnected) {
        try {
            await connectToDatabase();
            dbConnected = true;
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error('Database connection failed:', error);
            throw error;
        }
    }
};

// Handler para Vercel
export default async (req: any, res: any) => {
    try {
        await connectDB();
        app(req, res);
    } catch (error) {
        logger.error('Error in serverless function:', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error'
        });
    }
};