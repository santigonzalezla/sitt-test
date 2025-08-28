import express from "express";
import {login, logout, refreshToken, register, validate} from "../controllers/authentication";
import {body, cookie} from "express-validator";
import expressValidationError from "../lib/expressValidationError";
import {UserModel} from "../models/users";
import {getUserByEmail} from "../services/user";
import {authentication} from "../helpers";
import authenticate from "../middlewares/authenticate";

export default (router: express.Router) =>
{
    router.post(
        '/auth/register',
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address')
            .isLength({ min: 6, max: 64 }).withMessage('Email must be between 6 and 64 characters')
            .custom(async (value) =>
            {
                const userExists = await UserModel.exists({ email: value });

                if (userExists) throw new Error(`User with email ${value} already exists`);
            }),
        expressValidationError,
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 2 }).withMessage('Password must be at least 2 characters')
            .isLength({ max: 128 }).withMessage('Password must be at most 128 characters'),
        expressValidationError,
        register
    );
    router.post(
        '/auth/login',
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address')
            .isLength({ min: 6, max: 64 }).withMessage('Email must be between 6 and 64 characters')
            .custom(async (value) =>
            {
                const userExists = await UserModel.exists({ email: value });

                if (!userExists) throw new Error(`User with email ${value} does not exist`);
            }),
        expressValidationError,
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 2 }).withMessage('Password must be at least 2 characters')
            .isLength({ max: 128 }).withMessage('Password must be at most 128 characters')
            .custom(async (value, { req }) =>
            {
                const { email, password } = req.body;

                const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

                if (!user) throw new Error('User email or password is invalid');

                if (!user.authentication?.salt || !user.authentication?.password) throw new Error('User email or password is invalid');

                const expectedHash = authentication(user.authentication.salt, password);

                if (user.authentication.password !== expectedHash) throw new Error('User email or password is invalid');
            }),
        expressValidationError,
        login
    );
    router.post(
        '/auth/refresh',
        cookie('refreshToken')
            .notEmpty().withMessage('Refresh token required')
            .isJWT().withMessage('Refresh token must be a valid JWT'),
        expressValidationError,
        refreshToken
    );
    router.post(
        '/auth/validate',
        validate
    );
    router.post(
        '/auth/logout',
        authenticate,
        logout
    );
}