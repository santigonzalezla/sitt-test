import express from "express";
import {authentication, random} from "../helpers";
import {logger} from "../lib/winston";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from "../auth/jwt";
import environment from "../config";
import {createUser, getUserByEmail} from "../services/user";
import {TokenModel} from "../models/token";
import {Types} from "mongoose";
import jwt from "jsonwebtoken";

const { TokenExpiredError, JsonWebTokenError } = jwt;

export const register = async (req: express.Request, res: express.Response, next: express.NextFunction) =>
{
    try
    {
        const { email, password } = req.body;

        const salt = random();
        const user = await createUser({
            email: email.toLowerCase().trim(),
            authentication: {
                salt,
                password: authentication(salt, password)
            }
        });

        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id, user.email);

        await TokenModel.create({ token: refreshToken, userId: user._id });
        logger.info("Refresh token stored in database", {
            userId: user._id,
            token: refreshToken
        });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: environment.NODE_ENV === 'production', sameSite: 'strict' });

        return res.status(200).json({user: { id: user._id, email: user.email }, accessToken}).end();
    }
    catch (e)
    {
        logger.error(e);
        next(e);
    }
}

export const login = async (req: express.Request, res: express.Response) =>
{
    try
    {
        const { email, password } = req.body;

        if (!email || !password) return res.sendStatus(400);

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

        if (!user)
        {
            res.status(400).json({code: 'NotFound', message: 'User with email "' + email + '" not found.'});

            return;
        }

        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id, user.email);

        await TokenModel.create({ token: refreshToken, userId: user._id });
        logger.info("Refresh token stored in database", {
            userId: user._id,
            token: refreshToken
        });

        const salt = random();
        if (!user.authentication) user.authentication = { salt: '', password: '' };

        user.authentication.sessionToken = authentication(salt, user._id.toString());

        await user.save();

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: environment.NODE_ENV === 'production', sameSite: 'strict' });

        return res.status(200).json({user: { id: user._id, email: user.email }, accessToken}).end();
    }
    catch (e)
    {
        logger.error(e);
        return res.sendStatus(401);
    }
}

export const refreshToken = async (req: express.Request, res: express.Response) =>
{
    const refreshToken = req.cookies.refreshToken as string;

    try
    {
        const tokenExists = await TokenModel.exists({ token: refreshToken });

        if (!tokenExists)
        {
            res.status(401).json({ code: 'AuthenticationError', message: 'Invalid refresh token' });

            return;
        }

        const jwtPayload = verifyRefreshToken(refreshToken) as { userId: Types.ObjectId, email: string };

        const accessToken = generateAccessToken(jwtPayload.userId, jwtPayload.email);

        res.status(200).json({ accessToken });

    }
    catch (e)
    {
        if (e instanceof TokenExpiredError)
        {
            res.status(401).json({ code: 'AuthenticationError', message: 'Refresh token expired, please login again' });
            return;
        }

        if (e instanceof JsonWebTokenError)
        {
            res.status(401).json({ code: 'AuthenticationError', message: 'Invalid refresh token' });
            return;
        }

        logger.error(e);
        return res.sendStatus(401);
    }
}

export const validate = async (req: express.Request, res: express.Response) =>
{
    try
    {
        const { token } = req.body;

        if (!token)
        {
            return res.status(400).json({
                code: 'ValidationError',
                message: 'Token is required'
            });
        }

        try
        {
            const decoded = jwt.verify(token, environment.JWT_ACCESS_SECRET) as { userId: Types.ObjectId, email: string, iat: number, exp: number };

            const user = await getUserByEmail(decoded.email);
            if (!user) {
                return res.status(401).json({
                    code: 'AuthenticationError',
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                valid: true,
                user: {
                    id: decoded.userId,
                    email: decoded.email
                },
                tokenInfo: {
                    issuedAt: new Date(decoded.iat * 1000),
                    expiresAt: new Date(decoded.exp * 1000)
                }
            });

        }
        catch (jwtError)
        {
            if (jwtError instanceof TokenExpiredError)
            {
                return res.status(401).json({
                    code: 'AuthenticationError',
                    message: 'Token has expired'
                });
            }

            if (jwtError instanceof JsonWebTokenError)
            {
                return res.status(401).json({
                    code: 'AuthenticationError',
                    message: 'Invalid token'
                });
            }

            logger.error('JWT verification error:', jwtError);
            return res.status(500).json({code: 'ServerError', message: 'Internal server error'});
        }

    }
    catch (e)
    {
        logger.error('Token validation error:', e);
        return res.status(500).json({code: 'ServerError', message: 'Internal server error'});
    }
};

export const logout = async (req: express.Request, res: express.Response) =>
{
    try
    {
        const refreshToken = req.cookies.refreshToken as string;

        if (refreshToken)
        {
            await TokenModel.deleteOne({ token: refreshToken });
            logger.info("User refresh token deleted from database", {
                user: req.user,
                token: refreshToken
            });
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: environment.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.sendStatus(204);

        logger.info("User logged out successfully", { user: req.user });
    }
    catch (e)
    {
        logger.error(e);
        res.status(500).json({ code: 'ServerError', message: 'Internal server error' });
    }
}