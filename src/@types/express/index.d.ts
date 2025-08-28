import {Types} from "mongoose";
import * as express from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: Types.ObjectId;
                email: string;
            };
        }
    }
}