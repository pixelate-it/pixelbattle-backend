import { FastifyRequest, RouteOptions } from "fastify";
import { CookieSerializeOptions } from "@fastify/cookie";
import { IncomingMessage, Server, ServerResponse } from "http";
import { DiscordAuthHelper } from "../../helpers/AuthHelper";
import { AuthLoginError, NotVerifiedEmailError } from "../../apiErrors";
import { MongoUser, UserRole } from "../../models/MongoUser";
import { utils } from "../../extra/Utils";
import { config } from "../../config";

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
        const { token: discordToken } = await request.server.discordOauth2.getAccessTokenFromAuthorizationCodeFlow(request as FastifyRequest);
        if(!discordToken) throw new AuthLoginError();

        const helper = new DiscordAuthHelper();

        const { id, username, email, verified } = await helper.getUserInfo(discordToken);
        if(!email || !verified) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id" | "userID" | "username"> | null = await request.server.database.users
            .findOne(
                { $or: [{ connections: { discord: { id } } }, { email }] },
                {
                    projection: {
                        _id: 0,
                        userID: 0,
                        username: 0
                    }
                }
            );

        const token = user?.token || utils.generateToken();
        const userID = utils.generateId();

        await request.server.database.users
            .updateOne(
                {
                    userID: id
                },
                {
                    $set: {
                        token,
                        email,
                        userID,
                        username: username,
                        cooldown: user?.cooldown ?? 0,
                        tag: user?.tag ?? null,
                        badges: user?.badges ?? [],
                        points: user?.points ?? 0,
                        role: user?.role ?? UserRole.User,
                        connections: {
                            discord: {
                                accessToken: discordToken.access_token,
                                refreshToken: discordToken.refresh_token!,
                                id
                            },
                            google: user?.connections?.google ?? null
                        }
                    }
                },
                { upsert: true }
            );

        helper.joinPixelateITServer(discordToken);

        const params: CookieSerializeOptions = {
            domain: config.frontend.split('//')[1].split(':')[0],
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
            path: '/',
            httpOnly: false,
            sameSite: "none",
            secure: true
        }

        return response
            .cookie('token', token, params)
            .cookie('userid', userID, params)
            .redirect(config.frontend);
    }
}