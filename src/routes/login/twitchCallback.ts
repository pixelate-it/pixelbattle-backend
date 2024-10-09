import type { FastifyRequest, RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { cookieParameters, TwitchAuthHelper } from "helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "utils/templateHttpError";
import { type MongoUser, UserRole } from "models/MongoUser";
import * as generator from "utils/generator";
import { getIpAddress } from "utils/getIpAddress";
import { config } from "config";
import { LoggingHelper } from "helpers/LoggingHelper";

export const twitchCallback: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse
> = {
    method: "GET",
    url: "/twitch/callback",
    config: {
        rateLimit: {
            max: 2,
            timeWindow: 10000
        }
    },
    async handler(request, response) {
        const { token: twitchToken } = await request.server.twitchOauth2
            .getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest)
            .catch(() => {
                throw new AuthLoginError();
            });
        if (!twitchToken) throw new AuthLoginError();

        const helper = new TwitchAuthHelper();

        const { id, login, display_name, email } = await helper
            .getUserInfo(twitchToken)
            .catch(() => {
                throw new AuthLoginError();
            });
        if (!email) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null =
            await request.server.database.users.findOne(
                { $or: [{ connections: { twitch: { id } } }, { email }] },
                { projection: { _id: 0 }, hint: { userID: 1 } }
            );

        const token = user?.token || generator.generateToken();
        const userID = user?.userID || generator.generateId();

        await request.server.database.users.updateOne(
            { userID },
            {
                $set: {
                    token,
                    email: user?.email ?? email,
                    username: user?.username ?? (display_name || login),
                    tag: user?.tag ?? null,
                    badges: user?.badges ?? 0,
                    points: user?.karma ?? 0,
                    role: user?.role ?? UserRole.User,
                    connections: {
                        twitch: {
                            visible: user?.connections.twitch?.visible ?? true,
                            username: display_name || login,
                            id
                        },
                        discord: user?.connections.discord ?? null,
                        google: user?.connections.google ?? null,
                        github: user?.connections.github ?? null
                    }
                }
            },
            { upsert: true, hint: { userID: 1 } }
        );

        LoggingHelper.sendLoginSuccess({
            userID,
            nickname: user?.username ?? (display_name || login),
            method: "Discord",
            ip: getIpAddress(request)
        });

        return response
            .cookie("token", token, cookieParameters)
            .cookie("userid", userID, cookieParameters)
            .redirect(config.frontend);
    }
};
