export type DiscordUserId = string;

export enum UserRole {
    User = 0,
    Moderator = 1,
    Admin = 2
}

export interface BanInfo {
    moderatorID: DiscordUserId;
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
    banned: BanInfo | null;
}