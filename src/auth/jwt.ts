import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import environment from "../config";

export const generateAccessToken = (userId: Types.ObjectId, email: string): string =>
{
    return jwt.sign(
        { userId, email },
        environment.JWT_ACCESS_SECRET,
        {
            expiresIn: environment.ACCESS_TOKEN_EXPIRATION,
            subject: 'accessApi'
        }
    );
}

export const generateRefreshToken = (userId: Types.ObjectId, email: string): string =>
{
    return jwt.sign(
        { userId, email },
        environment.JWT_REFRESH_SECRET,
        {
            expiresIn: environment.REFRESH_TOKEN_EXPIRATION,
            subject: 'refreshToken'
        }
    );
}

export const verifyAccessToken = (token: string) =>
{
    return jwt.verify(token, environment.JWT_ACCESS_SECRET);
}

export const verifyRefreshToken = (token: string) =>
{
    return jwt.verify(token, environment.JWT_REFRESH_SECRET);
}