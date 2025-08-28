import winston from "winston";
import environment from "../config";

const { combine, timestamp, json, errors, align, printf, colorize } = winston.format;

const transports: winston.transport[] = [];

if (environment.NODE_ENV !== 'production')
{
    transports.push(
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
                align(),
                printf(({timestamp, level, message, ...meta}) => {
                    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';

                    return `[${timestamp}] [${level}]:${message}${metaString}`;
                })
            )
        })
    )
}

const logger = winston.createLogger({
    level: environment.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
    ),
    transports,
    silent: environment.NODE_ENV === 'test',
});

export { logger };