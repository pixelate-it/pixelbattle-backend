import type { CookieSerializeOptions } from "@fastify/cookie";
import type { Token } from "@fastify/oauth2";
import { config } from "../config";

export const cookieParameters: CookieSerializeOptions = {
    domain: config.frontend.split("//")[1].split(":")[0],
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
    path: "/",
    httpOnly: false,
    sameSite: "none",
    secure: true
};

export class DiscordAuthHelper {
    private static API_URL = "https://discord.com/api";
    public userId!: string;

    async getUserInfo({ token_type, access_token }: Token) {
        const mixin = await fetch(`${DiscordAuthHelper.API_URL}/users/@me`, {
            method: "GET",
            headers: {
                Content_Type: "application/json",
                Authorization: `${token_type} ${access_token}`
            }
        });

        const data = (await mixin.json()) as DiscordUser;

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
                    "Content-Type": "application/json",
                    Authorization: `Bot ${config.discord.bot.token}`
                }
            }
        );
    }
}

export class GoogleAuthHelper {
    private static API_URL = "https://www.googleapis.com/oauth2/v2";
    public userId!: string;

    async getUserInfo({ access_token }: Token) {
        const mixin = await fetch(
            `${GoogleAuthHelper.API_URL}/userinfo/?` +
                new URLSearchParams({ access_token }),
            {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            }
        );

        const data = (await mixin.json()) as GoogleUser;

        this.userId = data.id;
        return data;
    }
}

export class TwitchAuthHelper {
    private static API_URL = "https://api.twitch.tv/helix";
    public userId!: string;

    async getUserInfo({ access_token, token_type }: Token) {
        const mixin = await fetch(`${TwitchAuthHelper.API_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${
                    token_type[0].toUpperCase() + token_type.slice(1)
                } ${access_token}`,
                "Client-Id": config.twitch.id
            }
        });

        const data = (await mixin.json()) as { data: [TwitchUser] };

        this.userId = data.data[0].id;
        return data.data[0];
    }
}

export class GithubAuthHelper {
    private static API_URL = "https://api.github.com";
    public userId!: string;

    async getUserInfo({ access_token, token_type }: Token) {
        const mixin = await fetch(`${GithubAuthHelper.API_URL}/user`, {
            method: "GET",
            headers: {
                Authorization: `${
                    token_type[0].toUpperCase() + token_type.slice(1)
                } ${access_token}`
            }
        });

        const data = (await mixin.json()) as GithubUser;

        this.userId = String(data.id);
        return data;
    }
}
