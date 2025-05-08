import type { FastifyRequest, RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { TwitchAuthHelper } from "../helpers/twitch.helper";
import { BaseOAuthHandler } from "./base-callback";
import type { TwitchUser } from "@types";

export const twitchCallback: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { code: string } }
> = {
    method: "GET",
    url: "/twitch/callback",
    schema: {
        querystring: {
            type: "object",
            properties: {
                code: { type: "string" }
            },
            required: ["code"],
            additionalProperties: false
        }
    },
    config: { rateLimit: { max: 3, timeWindow: 10000 } },
    handler: new (class extends BaseOAuthHandler<TwitchUser> {
        providerName = "twitch" as const;
        authHelper = TwitchAuthHelper;

        getOAuthToken = async (request: FastifyRequest) => {
            const { token } =
                await request.server.twitchOauth2.getAccessTokenFromAuthorizationCodeFlow(
                    request
                );
            return token;
        };

        extractUserData = (userInfo: TwitchUser) => {
            return {
                id: userInfo.id,
                email: userInfo.email,
                username: userInfo.display_name || userInfo.login,
                verified: true
            };
        };
    })().handle
};
