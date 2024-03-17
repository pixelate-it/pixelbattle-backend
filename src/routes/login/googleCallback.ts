import { RouteOptions, FastifyRequest } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { GoogleAuthHelper, cookieParameters } from "../../helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "../../apiErrors";
import { MongoUser, UserRole } from "../../models/MongoUser";
import { utils } from "../../extra/Utils";
import { config } from "../../config";

export const googleCallback: RouteOptions<Server, IncomingMessage, ServerResponse> = {
    method: 'GET',
    url: '/google/callback',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '10s'
        }
    },
    async handler(request, response) {
        const { token: googleToken } = await request.server.googleOauth2.getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest);
        if(!googleToken) throw new AuthLoginError();
        if(!googleToken.refresh_token) throw new AuthLoginError();

        const helper = new GoogleAuthHelper();

        const { id, name, email, verified_email } = await helper.getUserInfo(googleToken);
        if(!email || !verified_email) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id"> | null = await request.server.database.users
            .findOne(
                { $or: [{ connections: { google: { id } } }, { email }] },
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
                        username: user?.username ?? name,
                        cooldown: user?.cooldown ?? 0,
                        tag: user?.tag ?? null,
                        badges: user?.badges ?? [],
                        points: user?.points ?? 0,
                        role: user?.role ?? UserRole.User,
                        connections: {
                            twitch: user?.connections.twitch ?? null,
                            discord: user?.connections.discord ?? null,
                            google: {
                                accessToken: googleToken.access_token,
                                refreshToken: googleToken.refresh_token!,
                                id
                            }
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