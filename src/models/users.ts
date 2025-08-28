import {model, Schema} from "mongoose";
import {isValidEmail} from "../lib/validators";

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email: string) {
                return isValidEmail(email);
            },
            message: 'Please provide a valid email address'
        }
    },
    authentication: {
        password: { type: String, required: true, select: false, minLength: [2, 'Password must be at least 8 characters'] },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    }
}, { timestamps: true });

export const UserModel = model('User', UserSchema);


