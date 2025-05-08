import type { FastifyRequest, RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { GoogleAuthHelper } from "../helpers/google.helper";
import { NotVerifiedEmailError } from "@core/errors";
import { BaseOAuthHandler } from "./base-callback";
import { type MongoUser } from "@models";
import type { GoogleUser } from "@types";

export const googleCallback: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { code: string } }
> = {
    method: "GET",
    url: "/google/callback",
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
    handler: new (class extends BaseOAuthHandler<GoogleUser> {
        providerName = "google" as const;
        authHelper = GoogleAuthHelper;

        getOAuthToken = async (request: FastifyRequest) => {
            const { token } =
                await request.server.googleOauth2.getAccessTokenFromAuthorizationCodeFlow(
                    request
                );
            return token;
        };

        extractUserData = (userInfo: GoogleUser) => {
            const correctedName =
                userInfo.name?.split(" ")[0] ||
                userInfo.email?.split("@")[0] ||
                "user";
            return {
                id: userInfo.id,
                email: userInfo.email,
                username: correctedName,
                verified: userInfo.verified_email
            };
        };

        protected getUpdateData(
            existingUser: Omit<MongoUser, "_id"> | null,
            data: {
                id: string;
                email: string;
                username: string;
                authToken: string;
            }
        ) {
            const baseData = super.getUpdateData(existingUser, data);
            return {
                ...baseData,
                username: data.username
            };
        }

        protected checkEmailVerification = (userInfo: GoogleUser): void => {
            if (!userInfo.email || !userInfo.verified_email) {
                throw new NotVerifiedEmailError();
            }
        };
    })().handle
};
