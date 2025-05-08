import type { Token } from "@fastify/oauth2";
import type { SocialAccount } from "./types";

export abstract class AuthHelper<T extends SocialAccount> {
    protected abstract API_URL: string;
    public userId!: string;

    protected abstract getUserInfoEndpoint(): string;
    protected abstract getAuthHeaders(token: Token): Record<string, string>;

    async getUserInfo(token: Token): Promise<T> {
        const response = await fetch(
            `${this.API_URL}${this.getUserInfoEndpoint()}`,
            {
                method: "GET",
                headers: this.getAuthHeaders(token)
            }
        );

        const data = (await response.json()) as T;
        this.userId = String(data.id);
        return data;
    }
}
