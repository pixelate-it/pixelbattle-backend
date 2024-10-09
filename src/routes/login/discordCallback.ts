import type { FastifyRequest, RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { cookieParameters, DiscordAuthHelper } from "helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "utils/templateHttpError";
import { type MongoUser, UserRole } from "models/MongoUser";
import * as generator from "utils/generator";
import { getIpAddress } from "utils/getIpAddress";
import { config } from "config";
import { LoggingHelper } from "helpers/LoggingHelper";

export const discordCallback: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse
> = {
    method: "GET",
    url: "/discord/callback",
    config: {
        rateLimit: {
            max: 2,
            timeWindow: 10000
        }
    },
    async handler(request, response) {
        const { token: discordToken } = await request.server.discordOauth2
            .getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest)
            .catch(() => {
                throw new AuthLoginError();
            });
        if (!discordToken) throw new AuthLoginError();

        const helper = new DiscordAuthHelper();

        const { id, username, global_name, email, verified } = await helper
            .getUserInfo(discordToken)
            .catch(() => {
                throw new AuthLoginError();
            });
        if (!email || !verified) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null =
            await request.server.database.users.findOne(
                { $or: [{ connections: { discord: { id } } }, { email }] },
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
                    username: user?.username ?? (global_name || username),
                    tag: user?.tag ?? null,
                    badges: user?.badges ?? 0,
                    points: user?.karma ?? 0,
                    role: user?.role ?? UserRole.User,
                    connections: {
                        twitch: user?.connections.twitch ?? null,
                        discord: {
                            visible: user?.connections.discord?.visible ?? true,
                            username: global_name || username,
                            id
                        },
                        github: user?.connections.github ?? null,
                        google: user?.connections.google ?? null
                    }
                }
            },
            { upsert: true, hint: { userID: 1 } }
        );

        LoggingHelper.sendLoginSuccess({
            userID,
            nickname: user?.username ?? (global_name || username),
            method: "Discord",
            ip: getIpAddress(request)
        });

        helper.joinPixelateITServer(discordToken);

        return response
            .cookie("token", token, cookieParameters)
            .cookie("userid", userID, cookieParameters)
            .redirect(config.frontend);
    }
};
