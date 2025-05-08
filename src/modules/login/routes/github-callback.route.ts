import type { FastifyRequest, RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { GithubAuthHelper } from "../helpers/github.helper";
import { BaseOAuthHandler } from "./base-callback";
import { type MongoUser } from "@models";
import type { GithubUser } from "@types";

export const githubCallback: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse
> = {
    method: "GET",
    url: "/github/callback",
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
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 10000
        }
    },
    handler: new //@ts-ignore
    (class extends BaseOAuthHandler<GithubUser> {
        providerName = "github" as const;
        authHelper = GithubAuthHelper;

        getOAuthToken = async (request: FastifyRequest) => {
            const { token } =
                await request.server.githubOauth2.getAccessTokenFromAuthorizationCodeFlow(
                    request
                );
            return token;
        };

        extractUserData = (userInfo: GithubUser) => {
            return {
                id: String(userInfo.id),
                email: userInfo.email ?? undefined,
                username: userInfo.name || userInfo.login,
                verified: true
            };
        };

        protected getConnectionsUpdate(
            existingUser: Omit<MongoUser, "_id"> | null,
            data: { id: string; username: string }
        ) {
            const connections = super.getConnectionsUpdate(existingUser, data);
            return {
                ...connections,
                github: {
                    visible: connections.github?.visible ?? true,
                    username: data.username,
                    id: data.id
                }
            };
        }
    })().handle
};
