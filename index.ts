import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import router from "./src/router/index";
import environment from "./src/config/index";
import helmet from "helmet";
import limiter from "./src/lib/express_rate_limit";
import {connectToDatabase} from "./src/database/mongoose";
import {logger} from "./src/lib/winston";
import {errorHandler, notFoundHandler} from "./src/middlewares/errorHandler";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./src/swagger";

const app = express();

app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(helmet());
app.use(limiter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', router());
app.use(notFoundHandler);
app.use(errorHandler);


(async () =>
{
    try
    {
        await connectToDatabase();

        const server = http.createServer(app);

        server.listen(environment.PORT, () => {
            logger.info(`Server is running on port:${environment.PORT}`);
        });

    }
    catch (e)
    {
        logger.error("Error starting server", e);
    }
})();
