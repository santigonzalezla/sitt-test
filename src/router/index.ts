import express from "express";
import authentication from "./authentication";
import users from "./users";

const router = express.Router();

router.get('/', (req, res) =>
{
    res.status(200).json({
        message: "Welcome to the API",
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
})

export default (): express.Router =>
{
    authentication(router);
    users(router);

    return router
};