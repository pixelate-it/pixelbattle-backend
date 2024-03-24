import { FastifyRequest, RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { DiscordAuthHelper, cookieParameters } from "../../helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "../../apiErrors";
import { MongoUser, UserRole } from "../../models/MongoUser";
import { utils } from "../../extra/Utils";
import { config } from "../../config";
import { LoggingHelper } from "../../helpers/LoggingHelper";

export const discordCallback: RouteOptions<Server, IncomingMessage, ServerResponse> = {
    method: 'GET',
    url: '/discord/callback',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '10s'
        }
    },
    async handler(request, response) {
        const { token: discordToken } = await request.server.discordOauth2.getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest)
            .catch(() => { throw new AuthLoginError() });
        if(!discordToken) throw new AuthLoginError();

        const helper = new DiscordAuthHelper();

        const { id, username, global_name, email, verified } = await helper.getUserInfo(discordToken)
            .catch(() => { throw new AuthLoginError() });;
        if(!email || !verified) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null = await request.server.database.users
            .findOne(
                { $or: [{ connections: { discord: { id } } }, { email }] },
                { projection: { _id: 0 }, hint: { userID: 1 } }
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
                        username: user?.username ?? (global_name || username),
                        cooldown: user?.cooldown ?? 0,
                        tag: user?.tag ?? null,
                        badges: user?.badges ?? 0,
                        points: user?.points ?? 0,
                        role: user?.role ?? UserRole.User,
                        connections: {
                            twitch: user?.connections.twitch ?? null,
                            discord: {
                                visible: user?.connections.discord?.visible ?? true,
                                username: global_name || username,
                                id
                            },
                            google: user?.connections.google ?? null
                        }
                    }
                },
                { upsert: true, hint: { userID: 1 } }
            );

        const cloudflareIpHeaders = request.headers['cf-connecting-ip'];
        LoggingHelper.sendLoginSuccess({
            userID,
            nickname: user?.username ?? (global_name || username),
            method: 'Discord',
            ip: cloudflareIpHeaders
                ? Array.isArray(cloudflareIpHeaders)
                    ? cloudflareIpHeaders[0]
                    : cloudflareIpHeaders
                : request.ip,
        });

        helper.joinPixelateITServer(discordToken);

        return response
            .cookie('token', token, cookieParameters)
            .cookie('userid', userID, cookieParameters)
            .redirect(config.frontend);
    }
}