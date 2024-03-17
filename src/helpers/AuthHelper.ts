import { Token } from "@fastify/oauth2";
import fetch from "node-fetch"
import { config } from "../config";

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

export class DiscordAuthHelper {
    private userId!: string;
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
        );
    }
}
