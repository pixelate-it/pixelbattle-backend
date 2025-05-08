import type { UserAuthKey } from "@models";

export interface PixelInfo {
    userID: string;
    nickname: string;
    x: number;
    y: number;
    tag: string | null;
    color: string;
    ip: string;
}

export interface LoginInfo {
    userID: string;
    nickname: string;
    method: UserAuthKey;
    ip: string;
}
