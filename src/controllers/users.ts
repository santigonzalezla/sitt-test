import express from 'express';

import {logger} from "../lib/winston";
import {deleteUserById, getUsers} from "../services/user";

export const getAllUsers = async (req: express.Request, res: express.Response) =>
{
    try
    {
        const users = await getUsers();

        return res.status(200).json(users);
    }
    catch (e)
    {
        logger.error(e);
        return res.sendStatus(400);
    }
}

export const deleteUser = async (req: express.Request, res: express.Response) =>
{
    try
    {
        const { id } = req.params;

        if (!id) return res.sendStatus(400);

        await deleteUserById(id);

        return res.sendStatus(204);
    }
    catch (e)
    {
        logger.error(e);
        return res.sendStatus(400);
    }
}