import type { FastifyRequest, RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { DiscordAuthHelper } from "../helpers/discord.helper";
import { BaseOAuthHandler } from "./base-callback";
import { NotVerifiedEmailError } from "@core/errors";
import type { DiscordUser } from "@types";

export const discordCallback: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { code: string } }
> = {
    method: "GET",
    url: "/discord/callback",
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
    handler: new (class extends BaseOAuthHandler<DiscordUser> {
        providerName = "discord" as const;
        authHelper = DiscordAuthHelper;

        getOAuthToken = async (request: FastifyRequest) => {
            const { token } =
                await request.server.discordOauth2.getAccessTokenFromAuthorizationCodeFlow(
                    request
                );
            return token;
        };

        extractUserData = (userInfo: DiscordUser) => {
            return {
                id: userInfo.id,
                email: userInfo.email,
                username: userInfo.global_name || userInfo.username,
                verified: userInfo.verified
            };
        };

        protected checkEmailVerification = (userInfo: DiscordUser): void => {
            if (!userInfo.email || !userInfo.verified) {
                throw new NotVerifiedEmailError();
            }
        };
    })().handle
};
