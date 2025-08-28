import express from 'express';
import { merge } from "lodash";
import { getUserBySessionToken } from "../models/users";
import {logger} from "../lib/winston";

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) =>
{
    try
    {
        const sessionToken = req.cookies['SANTIAGO-AUTH'];

        if (!sessionToken) return res.sendStatus(403);

        const existingUser = await getUserBySessionToken(sessionToken);

        if (!existingUser) return res.sendStatus(403);

        merge(req, { identity: existingUser });

        return next();
    }
    catch (e)
    {
        logger.error(e);
        return res.sendStatus(401);
    }
}