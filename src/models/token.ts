import {model, Schema} from "mongoose";

const TokenSchema = new Schema({
    token: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

export const TokenModel = model('Token', TokenSchema);