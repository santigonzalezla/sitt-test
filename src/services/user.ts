import {UserModel} from "../models/users";

export const getUsers = () => UserModel.find();
export const getUserById = (id: string) => UserModel.findById(id);
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserBySessionToken = (sessionToken: string) => UserModel.findOne({
    'authentication.sessionToken': sessionToken
});
export const createUser = (values: Record<string, any>) =>
{
    return new UserModel(values).save().then((user) => user.toObject());
}
export const updateUserById = (id: string, values: Record<string, any>) =>
{
    return UserModel.findByIdAndUpdate(id, values);
}
export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id });