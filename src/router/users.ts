import express from "express";
import {getAllUsers} from "../controllers/users";
import authenticate from "../middlewares/authenticate";

export default (router: express.Router) =>
{
    router.get('/users', authenticate, getAllUsers);
}