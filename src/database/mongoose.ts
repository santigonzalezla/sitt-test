import mongoose, { ConnectOptions } from "mongoose";
import environment from "../config";
import {logger} from "../lib/winston";

const clientOptions: ConnectOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
}

export const connectToDatabase = async (): Promise<void> =>
{
    if (!environment.MONGODB_URI) throw new Error("MongoDB URI is not defined in environment variables");

    try
    {
        await mongoose.connect(environment.MONGODB_URI, clientOptions);
        logger.info("Connected to Database successfully", {
            uri: environment.MONGODB_URI,
            options: clientOptions
        });
    }
    catch (e)
    {
        if (e instanceof Error) throw e;

        logger.error("Error connecting to Database", e);
    }
}

export const disconnectFromDatabase = async (): Promise<void> =>
{
    try
    {
        await mongoose.disconnect();
        logger.warn("Disconnected from Database");
    }
    catch (e)
    {
        if (e instanceof Error) throw e;

        logger.error("Error disconnecting from Database", e);
    }
}