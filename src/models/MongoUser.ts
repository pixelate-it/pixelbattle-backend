
export type UserRole = "USER" | "MOD" | "ADMIN"
export interface MongoUser {
    username: string;
    tag: string | null;
    userID: string;
    cooldown: number;
    role: UserRole;
    isBanned: boolean;
    token: string;
    badges: string[];
    points: number;
}