import { RouteOptions, FastifyRequest } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { GithubAuthHelper, cookieParameters } from "../../helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "../../apiErrors";
import { MongoUser, UserRole } from "../../models/MongoUser";
import { utils } from "../../extra/Utils";
import { config } from "../../config";
import { LoggingHelper } from "../../helpers/LoggingHelper";

export const githubCallback: RouteOptions<Server, IncomingMessage, ServerResponse> = {
    method: 'GET',
    url: '/github/callback',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '10s'
        }
    },
    async handler(request, response) {
        const { token: githubToken } = await request.server.githubOauth2.getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest)
            .catch(() => { throw new AuthLoginError() });

        const helper = new GithubAuthHelper();

        const { login, name, email } = await helper.getUserInfo(githubToken)
            .catch(() => { throw new AuthLoginError() });
        if(!email) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null = await request.server.database.users
            .findOne(
                { $or: [{ connections: { github: { id: helper.userId } } }, { email }] },
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
                        username: user?.username ?? (name || login),
                        cooldown: user?.cooldown ?? 0,
                        tag: user?.tag ?? null,
                        badges: user?.badges ?? 0,
                        points: user?.karma ?? 0,
                        role: user?.role ?? UserRole.User,
                        connections: {
                            twitch: user?.connections.twitch ?? null,
                            discord: user?.connections.discord ?? null,
                            google: user?.connections.google ?? null,
                            github: {
                                visible: user?.connections.github?.visible ?? true,
                                username: name || login,
                                id: helper.userId
                            },
                        }
                    }
                },
                { upsert: true, hint: { userID: 1 } }
            );

        const cloudflareIpHeaders = request.headers['cf-connecting-ip'];
        LoggingHelper.sendLoginSuccess({
            userID,
            nickname: user?.username ?? (name || login),
            method: 'Google',
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