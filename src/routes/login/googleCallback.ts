import type { FastifyRequest, RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { cookieParameters, GoogleAuthHelper } from "helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "utils/templateHttpError";
import { type MongoUser, UserRole } from "models/MongoUser";
import * as generator from "utils/generate";
import { getIpAddress } from "utils/getIpAddress";
import { config } from "config";
import { LoggingHelper } from "helpers/LoggingHelper";

export const googleCallback: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse
> = {
    method: "GET",
    url: "/google/callback",
    config: {
        rateLimit: {
            max: 2,
            timeWindow: 10000
        }
    },
    async handler(request, response) {
        const { token: googleToken } = await request.server.googleOauth2
            .getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest)
            .catch(() => {
                throw new AuthLoginError();
            });
        if (!googleToken) throw new AuthLoginError();

        const helper = new GoogleAuthHelper();

        const { id, name, email, verified_email } = await helper
            .getUserInfo(googleToken)
            .catch(() => {
                throw new AuthLoginError();
            });
        if (!email || !verified_email) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null =
            await request.server.database.users.findOne(
                { $or: [{ connections: { google: { id } } }, { email }] },
                { projection: { _id: 0 }, hint: { userID: 1 } }
            );

        const token = user?.token || generator.generateToken();
        const userID = user?.userID || generator.generateId();

        const correctedName = name.split(" ")[0];

        await request.server.database.users.updateOne(
            { userID },
            {
                $set: {
                    token,
                    email: user?.email ?? email,
                    username: user?.username ?? correctedName,
                    tag: user?.tag ?? null,
                    badges: user?.badges ?? 0,
                    points: user?.karma ?? 0,
                    role: user?.role ?? UserRole.User,
                    connections: {
                        twitch: user?.connections.twitch ?? null,
                        discord: user?.connections.discord ?? null,
                        google: {
                            visible: user?.connections.google?.visible ?? true,
                            username: correctedName,
                            id
                        },
                        github: user?.connections.github ?? null
                    }
                }
            },
            { upsert: true, hint: { userID: 1 } }
        );

        LoggingHelper.sendLoginSuccess({
            userID,
            nickname: user?.username ?? name,
            method: "Google",
            ip: getIpAddress(request)
        });

        return response
            .cookie("token", token, cookieParameters)
            .cookie("userid", userID, cookieParameters)
            .redirect(config.frontend);
    }
};
