import fetch from "node-fetch"
import { config } from "../config";

interface DiscordAccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

interface DiscordErrorResponse {
    error: true
}

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
    accent_color?: number;
}

export class AuthHelper {
    private accessToken!: string;
    private tokenType!: string;
    private userId!: string;


    async authCodeGrant(code: string) {
        const data: DiscordAccessTokenResponse | DiscordErrorResponse = await fetch(
            'https://discord.com/api/oauth2/token',
            {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: config.discord.bot.id,
					client_secret: config.discord.bot.secret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: config.discord.bot.redirectUri,
					scope: 'identify guilds.join',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(res => res.json());

        console.log(data)


        if ("error" in data) return data;

        this.accessToken = data.access_token;
        this.tokenType = data.token_type;

        console.log(data)


        return data;
    }

    async getUserInfo() {
        const data: DiscordUser = await fetch(
            'https://discord.com/api/users/@me',
            {
                method: 'GET',
                headers: { 
                    'Content_Type': 'application/json', 
                    Authorization: `${this.tokenType} ${this.accessToken}` 
                }
            }
        ).then(res => res.json());

        console.log(data, `${this.tokenType} ${this.accessToken}`)

        this.userId = data.id;
        return data;
    }

    async joinPixelateitServer() {
        return await fetch(
            `https://discord.com/api/guilds/${config.discord.guildId}/members/${this.userId}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    access_token: this.accessToken
                }),
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bot ${config.discord.bot.token}`
                }
            }
        ).catch(() => {});
    }
}
