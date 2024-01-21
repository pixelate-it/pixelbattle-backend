
export type UserRole = "USER" | "MOD" | "ADMIN"
export type DiscordUserId = string;

export interface BanInfo {
    moderatorID: DiscordUserId
    timeout: number;
    reason: string | null;
}

export interface MongoUser {
    username: string;
    tag: string | null;
    userID: DiscordUserId;
    cooldown: number;
    role: UserRole;
    token: string;
    badges: string[];
    points: number;
    banned: BanInfo | null
}