import { RouteOptions, FastifyRequest } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { TwitchAuthHelper, cookieParameters } from "../../helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "../../apiErrors";
import { MongoUser, UserRole } from "../../models/MongoUser";
import { utils } from "../../extra/Utils";
import { config } from "../../config";
import { LoggingHelper } from "../../helpers/LoggingHelper";

export const twitchCallback: RouteOptions<Server, IncomingMessage, ServerResponse> = {
    method: 'GET',
    url: '/twitch/callback',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '10s'
        }
    },
    async handler(request, response) {
        const { token: twitchToken } = await request.server.twitchOauth2.getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest)
            .catch(() => { throw new AuthLoginError() });
        if(!twitchToken) throw new AuthLoginError();

        const helper = new TwitchAuthHelper();

        const { id, login, display_name, email } = await helper.getUserInfo(twitchToken)
            .catch(() => { throw new AuthLoginError() });
        if(!email) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null = await request.server.database.users
            .findOne(
                { $or: [{ connections: { twitch: { id } } }, { email }] },
                { projection: { _id: 0 }, hint: { userID: 1 }  }
            );

        const token = user?.token || utils.generateToken();
        const userID = user?.userID || utils.generateId();

        await request.server.database.users
            .updateOne(
                { userID },
                {
                    $set: {
                        token,
                        email,
                        username: user?.username ?? (display_name || login),
                        cooldown: user?.cooldown ?? 0,
                        tag: user?.tag ?? null,
                        badges: user?.badges ?? 0,
                        points: user?.points ?? 0,
                        role: user?.role ?? UserRole.User,
                        connections: {
                            twitch: {
                                visible: user?.connections.twitch?.visible ?? true,
                                username: display_name || login,
                                id
                            },
                            discord: user?.connections.discord ?? null,
                            google: user?.connections.google ?? null
                        }
                    }
                },
                { upsert: true, hint: { userID: 1 } }
            );

        const cloudflareIpHeaders = request.headers['cf-connecting-ip'];
        LoggingHelper.sendLoginSuccess({
            userID,
            nickname: user?.username ?? (display_name || login),
            method: 'Discord',
            ip: cloudflareIpHeaders
                ? Array.isArray(cloudflareIpHeaders)
                    ? cloudflareIpHeaders[0]
                    : cloudflareIpHeaders
                : request.ip,
        });

        return response
            .cookie('token', token, cookieParameters)
            .cookie('userid', userID, cookieParameters)
            .redirect(config.frontend);
    }
}