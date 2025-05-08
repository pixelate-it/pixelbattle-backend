import type { Token } from "@fastify/oauth2";
import { AuthHelper } from "./base.helper";
import type { DiscordUser } from "@types";
import { config } from "@core/config";

export class DiscordAuthHelper extends AuthHelper<DiscordUser> {
    protected API_URL = "https://discord.com/api";

    protected getUserInfoEndpoint(): string {
        return "/users/@me";
    }

    protected getAuthHeaders(token: Token): Record<string, string> {
        return {
            "Content-Type": "application/json",
            Authorization: `${token.token_type} ${token.access_token}`
        };
    }

    async joinPixelateITServer({ access_token }: Token) {
        return await fetch(
            `${this.API_URL}/guilds/${config.discord.guildId}/members/${this.userId}`,
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
