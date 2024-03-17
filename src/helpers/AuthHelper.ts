import { CookieSerializeOptions } from "@fastify/cookie";
import { Token } from "@fastify/oauth2";
import fetch from "node-fetch"
import { config } from "../config";

type TwitchType = 'admin' | 'global_mod' | 'staff' | '';
type BroadcasterType = 'affiliate' | 'partner' | '';

interface DiscordUser {
    id:	string;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar?: string;
    bot?: string;
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: string;
    accent_color?: number;
}

interface GoogleUser {
    id: string;
    email?: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name?: string;
    picture?: string;
    locale: string;
}

interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    type: TwitchType;
    broadcaster_type: BroadcasterType;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at: string;
}

export const cookieParameters: CookieSerializeOptions = {
    domain: config.frontend.split('//')[1].split(':')[0],
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
    path: '/',
    httpOnly: false,
    sameSite: "none",
    secure: true
}

export class DiscordAuthHelper {
    public userId!: string;
    private static API_URL = "https://discord.com/api";

    async getUserInfo({ token_type, access_token }: Token) {
        const data: DiscordUser = await fetch(
            `${DiscordAuthHelper.API_URL}/users/@me`,
            {
                method: 'GET',
                headers: { 
                    'Content_Type': 'application/json', 
                    Authorization: `${token_type} ${access_token}`
                }
            }
        ).then(res => res.json());


        this.userId = data.id;
        return data;
    }

    async joinPixelateITServer({ access_token }: Token) {
        return await fetch(
            `${DiscordAuthHelper.API_URL}/guilds/${config.discord.guildId}/members/${this.userId}`,
            {
                method: "PUT",
                body: JSON.stringify({ access_token }),
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bot ${config.discord.bot.token}`
                }
            }
        )
    }
}

export class GoogleAuthHelper {
    public userId!: string;
    private static API_URL = "https://www.googleapis.com/oauth2/v2";

    async getUserInfo({ access_token }: Token) {
        const data: GoogleUser = await fetch(
            `${GoogleAuthHelper.API_URL}/userinfo/?` + new URLSearchParams({ access_token }),
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        ).then(res => res.json());

        this.userId = data.id;
        return data;
    }
}

export class TwitchAuthHelper {
    public userId!: string;
    private static API_URL = "https://api.twitch.tv/helix";

    async getUserInfo({ access_token, token_type }: Token) {
        const data: { data: [TwitchUser] } = await fetch(
            `${TwitchAuthHelper.API_URL}/users`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                    'Client-Id': config.twitch.id
                }
            }
        ).then(res => res.json());

        return data.data[0];
    }
}