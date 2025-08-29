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
import swaggerSpec from '../src/swagger';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Crear la aplicación Express
const app = express();

// Middlewares
app.use(cors({
    credentials: true,
    origin: true // Permitir cualquier origen en desarrollo
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// Helmet sin CSP para Swagger
app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(limiter);

// Swagger Documentation con HTML personalizado
app.get('/docs', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SittTest API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
        <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin:0; background: #fafafa; }
            .swagger-ui .topbar { display: none }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
        <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify(swaggerSpec)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
        </script>
    </body>
    </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// Ruta de prueba para verificar que la API funciona
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes principales
app.use('/', router());

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Variable para controlar la conexión a la base de datos
let dbConnected = false;

const connectDB = async () => {
    if (!dbConnected) {
        try {
            await connectToDatabase();
            dbConnected = true;
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error('Database connection failed:', error);
            // No lanzar error, permitir que la API funcione sin BD para debug
        }
    }
};

// Handler principal para Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Conectar a la base de datos
        await connectDB();

        // Pasar la request y response a Express
        return app(req as any, res as any);
    } catch (error) {
        logger.error('Error in serverless function:', error);

        return res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};