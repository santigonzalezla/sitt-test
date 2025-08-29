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

const app = express();

// Middlewares
app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// Helmet con configuración específica para Swagger
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

app.use(limiter);

// Endpoint para servir el Swagger JSON spec
app.get('/swagger.json', (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        res.json(swaggerSpec);
    } catch (error) {
        logger.error('Error serving swagger spec:', error);
        res.status(500).json({ error: 'Failed to load swagger spec' });
    }
});

// Swagger Documentation con configuración mejorada
app.get('/docs', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SittTest API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
        <style>
            html { 
                box-sizing: border-box; 
                overflow: -moz-scrollbars-vertical; 
                overflow-y: scroll; 
            }
            *, *:before, *:after { 
                box-sizing: inherit; 
            }
            body { 
                margin: 0; 
                background: #fafafa; 
            }
            .swagger-ui .topbar { 
                display: none; 
            }
            .swagger-ui .info { 
                margin: 50px 0; 
            }
            .swagger-ui .scheme-container { 
                background: #fff; 
                box-shadow: 0 1px 2px 0 rgba(0,0,0,.15); 
            }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
        <script>
        window.onload = function() {
            try {
                const ui = SwaggerUIBundle({
                    url: '${baseUrl}/swagger.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout",
                    tryItOutEnabled: true,
                    requestInterceptor: function(request) {
                        // Asegurar que las requests van al servidor correcto
                        if (request.url.startsWith('/')) {
                            request.url = '${baseUrl}' + request.url;
                        }
                        return request;
                    },
                    responseInterceptor: function(response) {
                        return response;
                    }
                });
                
                // Log para debugging
                console.log('Swagger UI initialized successfully');
            } catch (error) {
                console.error('Error initializing Swagger UI:', error);
                document.getElementById('swagger-ui').innerHTML = 
                    '<div style="padding: 20px; color: red;">Error loading Swagger UI: ' + error.message + '</div>';
            }
        };
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// Routes
app.use('/', router());

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Conectar a la base de datos
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