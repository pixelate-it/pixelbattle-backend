import { ObjectId, Document } from "mongodb";

export type UserRole = "USER" | "MOD" | "ADMIN"
export interface MongoUser extends Document {
    _id: ObjectId
    username: string;
    tag: string | null;
    userID: string;
    cooldown: number;
    role: UserRole;
    isBanned: boolean;
    token: string;
}