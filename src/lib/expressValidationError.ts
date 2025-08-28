import express from "express";
import {validationResult} from "express-validator";

const expressValidationError = (req: express.Request | express.Response, res: express.Response, next: express.NextFunction) =>
{
    const errors = validationResult(req);

    if (!errors.isEmpty())
    {
        res.status(400).json({
            code: 'ValidationError',
            errors: errors.mapped()
        });

        return;
    }

    next();
}

export default expressValidationError;