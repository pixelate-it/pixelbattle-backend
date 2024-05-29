export type InternalUserId = string;

export enum UserRole {
    User = 0,
    Moderator = 1,
    Admin = 2
}

export interface BanInfo {
    moderatorID: InternalUserId;
    timeout: number;
    reason: string | null;
}

export interface AuthInfo {
    visible: boolean;
    username: string;
    id: string;
}

export interface UserAuth {
    discord: AuthInfo | null;
    google: AuthInfo | null;
    twitch: AuthInfo | null;
    github: AuthInfo | null;
}

export interface MongoUser {
    email: string;
    username: string;
    tag: string | null;
    userID: InternalUserId;
    cooldown: number;
    role: UserRole;
    token: string;
    badges: number;
    karma: number;
    banned: BanInfo | null;
    connections: UserAuth
}