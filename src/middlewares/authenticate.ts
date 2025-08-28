import express from "express";
import {verifyAccessToken} from "../auth/jwt";
import {Types} from "mongoose";
import jwt from "jsonwebtoken";

const { TokenExpiredError, JsonWebTokenError } = jwt;

const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) =>
{
    if (!req.headers.authorization)
    {
        res.status(401).json({
            code: 'AuthenticationError',
            message: 'Authorization header missing'
        });

        return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader.startsWith('Bearer '))
    {
        res.status(401).json({
            code: 'AuthenticationError',
            message: 'Authorization header missing or malformed'
        });

        return;
    }

    const [_, token] = authHeader.split(' ');

    try
    {
        const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId, email: string };

        req.user = {
            userId: jwtPayload.userId,
            email: jwtPayload.email
        };

        return next();

    }
    catch (e)
    {
        if (e instanceof TokenExpiredError)
        {
            res.status(401).json({
                code: 'AuthenticationError',
                message: 'Token expired'
            });
            return;
        }

        if (e instanceof JsonWebTokenError)
        {
            res.status(401).json({
                code: 'AuthenticationError',
                message: 'Invalid token'
            });
            return;
        }

        res.status(401).json({
            code: 'AuthenticationError',
            message: 'Invalid or expired token'
        });
    }
}

export default authenticate;