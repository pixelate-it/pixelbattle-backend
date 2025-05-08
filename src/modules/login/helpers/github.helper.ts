import type { Token } from "@fastify/oauth2";
import { AuthHelper } from "./base.helper";
import type { GithubUser } from "@types";

export class GithubAuthHelper extends AuthHelper<GithubUser> {
    protected API_URL = "https://api.github.com";

    protected getUserInfoEndpoint(): string {
        return "/user";
    }

    protected getAuthHeaders(token: Token): Record<string, string> {
        const tokenType =
            token.token_type[0].toUpperCase() + token.token_type.slice(1);
        return {
            Authorization: `${tokenType} ${token.access_token}`
        };
    }
}
