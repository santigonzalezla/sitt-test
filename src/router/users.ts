import express from "express";
import {getAllUsers} from "../controllers/users";
import authenticate from "../middlewares/authenticate";

export default (router: express.Router) =>
{
    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Obtener todos los usuarios
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuarios obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     example: 65f8a1b2c3d4e5f6a7b8c9d0
     *                   email:
     *                     type: string
     *                     example: usuario@ejemplo.com
     *                   createdAt:
     *                     type: string
     *                     format: date-time
     *                     example: 2024-01-15T10:30:00.000Z
     *                   updatedAt:
     *                     type: string
     *                     format: date-time
     *                     example: 2024-01-15T10:30:00.000Z
     *       401:
     *         description: Token de acceso inválido o faltante
     */
    router.get('/users', authenticate, getAllUsers);
}