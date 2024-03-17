import { RouteOptions, FastifyRequest } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { TwitchAuthHelper, cookieParameters } from "../../helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "../../apiErrors";
import { MongoUser, UserRole } from "../../models/MongoUser";
import { utils } from "../../extra/Utils";
import { config } from "../../config";

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
        const { token: twitchToken } = await request.server.twitchOauth2.getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest);
        if(!twitchToken) throw new AuthLoginError();

        const helper = new TwitchAuthHelper();

        const { id, login, display_name, email } = await helper.getUserInfo(twitchToken);
        if(!email) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null = await request.server.database.users
            .findOne(
                { $or: [{ connections: { twitch: { id } } }, { email }] },
                { projection: { _id: 0 }  }
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
                        badges: user?.badges ?? [],
                        points: user?.points ?? 0,
                        role: user?.role ?? UserRole.User,
                        connections: {
                            twitch: user?.connections.twitch ?? null,
                            discord: user?.connections.discord ?? null,
                            google: user?.connections.google ?? null
                        }
                    }
                },
                { upsert: true }
            );

        return response
            .cookie('token', token, cookieParameters)
            .cookie('userid', userID, cookieParameters)
            .redirect(config.frontend);
    }
}