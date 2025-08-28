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
    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Registrar un nuevo usuario
     *     tags: [Autenticación]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 minLength: 6
     *                 maxLength: 64
     *                 example: admin@admin.com
     *                 description: Email único del usuario
     *               password:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 128
     *                 example: 123
     *                 description: Contraseña del usuario
     *     responses:
     *       200:
     *         description: Usuario registrado exitosamente
     *         headers:
     *           Set-Cookie:
     *             description: Cookie httpOnly con refresh token
     *             schema:
     *               type: string
     *               example: refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: 65f8a1b2c3d4e5f6a7b8c9d0
     *                     email:
     *                       type: string
     *                       example: admin@admin.com
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       400:
     *         description: Error de validación
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 code:
     *                   type: string
     *                   example: ValidationError
     *                 errors:
     *                   type: object
     *                   additionalProperties:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                       param:
     *                         type: string
     *                       location:
     *                         type: string
     */
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

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Iniciar sesión de usuario
     *     tags: [Autenticación]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: admin@admin.com
     *               password:
     *                 type: string
     *                 example: 123
     *     responses:
     *       200:
     *         description: Inicio de sesión exitoso
     *         headers:
     *           Set-Cookie:
     *             description: Cookie httpOnly con refresh token
     *             schema:
     *               type: string
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: 65f8a1b2c3d4e5f6a7b8c9d0
     *                     email:
     *                       type: string
     *                       example: admin@admin.com
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       400:
     *         description: Usuario no encontrado o credenciales inválidas
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 code:
     *                   type: string
     *                   example: NotFound
     *                 message:
     *                   type: string
     *                   example: User with email "admin@admin.com" not found.
     */
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

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     summary: Renovar access token usando refresh token
     *     tags: [Autenticación]
     *     description: Requiere cookie httpOnly con refresh token válido
     *     parameters:
     *       - in: cookie
     *         name: refreshToken
     *         required: true
     *         schema:
     *           type: string
     *         description: JWT refresh token almacenado en cookie httpOnly
     *     responses:
     *       200:
     *         description: Token renovado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       401:
     *         description: Refresh token inválido o expirado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 code:
     *                   type: string
     *                   example: AuthenticationError
     *                 message:
     *                   type: string
     *                   example: Invalid refresh token
     */
    router.post(
        '/auth/refresh',
        cookie('refreshToken')
            .notEmpty().withMessage('Refresh token required')
            .isJWT().withMessage('Refresh token must be a valid JWT'),
        expressValidationError,
        refreshToken
    );

    /**
     * @swagger
     * /auth/validate:
     *   post:
     *     summary: Validar un access token
     *     tags: [Autenticación]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *             properties:
     *               token:
     *                 type: string
     *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                 description: JWT access token a validar
     *     responses:
     *       200:
     *         description: Token válido
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 valid:
     *                   type: boolean
     *                   example: true
     *                 user:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: 65f8a1b2c3d4e5f6a7b8c9d0
     *                     email:
     *                       type: string
     *                       example: admin@admin.com
     *                 tokenInfo:
     *                   type: object
     *                   properties:
     *                     issuedAt:
     *                       type: string
     *                       format: date-time
     *                       example: 2024-01-15T10:30:00.000Z
     *                     expiresAt:
     *                       type: string
     *                       format: date-time
     *                       example: 2024-01-15T10:45:00.000Z
     *       400:
     *         description: Token faltante
     *       401:
     *         description: Token inválido o expirado
     */
    router.post(
        '/auth/validate',
        validate
    );

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     summary: Cerrar sesión de usuario
     *     tags: [Autenticación]
     *     security:
     *       - bearerAuth: []
     *     description: Elimina el refresh token de la base de datos y limpia la cookie
     *     responses:
     *       204:
     *         description: Sesión cerrada exitosamente
     *       401:
     *         description: Token de acceso inválido o faltante
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 code:
     *                   type: string
     *                   example: AuthenticationError
     *                 message:
     *                   type: string
     *                   example: Authorization header missing
     */
    router.post(
        '/auth/logout',
        authenticate,
        logout
    );
}