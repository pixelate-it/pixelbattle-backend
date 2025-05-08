import type { Token } from "@fastify/oauth2";
import { AuthHelper } from "./base.helper";
import type { TwitchUser } from "@types";
import { config } from "@core/config";

export class TwitchAuthHelper extends AuthHelper<TwitchUser> {
    protected API_URL = "https://api.twitch.tv/helix";

    protected getUserInfoEndpoint(): string {
        return "/users";
    }

    protected getAuthHeaders(token: Token): Record<string, string> {
        const tokenType =
            token.token_type[0].toUpperCase() + token.token_type.slice(1);
        return {
            "Content-Type": "application/json",
            Authorization: `${tokenType} ${token.access_token}`,
            "Client-Id": config.twitch.id
        };
    }

    async getUserInfo(token: Token): Promise<TwitchUser> {
        const response = await super.getUserInfo(token);
        const data = response as unknown as { data: [TwitchUser] };
        this.userId = data.data[0].id;
        return data.data[0];
    }
}
