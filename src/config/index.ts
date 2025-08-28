import type ms from "ms";
import dotenv from "dotenv";
import * as process from "node:process";

dotenv.config();

const environment = {
    PORT: process.env.PORT || 4000,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    NODE_ENV: process.env.NODE_ENV,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION as ms.StringValue,
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION as ms.StringValue,
    MONGODB_URI: process.env.MONGODB_URI,
}

export default environment;