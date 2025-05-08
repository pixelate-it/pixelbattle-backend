import type { Token } from "@fastify/oauth2";
import { AuthHelper } from "./base.helper";
import type { GoogleUser } from "@types";

export class GoogleAuthHelper extends AuthHelper<GoogleUser> {
    protected API_URL = "https://www.googleapis.com/oauth2/v2";

    protected getUserInfoEndpoint(): string {
        return "/userinfo";
    }

    protected getAuthHeaders(): Record<string, string> {
        return {
            "Content-Type": "application/json"
        };
    }

    async getUserInfo(token: Token): Promise<GoogleUser> {
        const url = new URL(`${this.API_URL}${this.getUserInfoEndpoint()}`);
        url.searchParams.append("access_token", token.access_token);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: this.getAuthHeaders()
        });

        const data = (await response.json()) as GoogleUser;
        this.userId = data.id;
        return data;
    }
}
