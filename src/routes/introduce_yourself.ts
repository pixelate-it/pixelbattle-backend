import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { CookieSerializeOptions } from "@fastify/cookie";
import { AuthHelper } from "../helpers/AuthHelper";
import { MongoUser } from "../models/MongoUser";
import { utils } from "../extra/Utils";
import { config } from "../config";
import { AuthLoginError, NotVerifiedEmailError } from "../errors";
import { UserRole } from "../models/MongoUser";
import { LoggingHelper } from "../helpers/LoggingHelper";

export const introduce_yourself: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: { code: string }; }> = {
    method: 'GET',
    url: '/introduce_yourself',
    schema: {
        querystring: {
            code: { type: 'string' },
        }
    },
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '5s'
        }
    },
    async handler(request, response) {
        const auth = new AuthHelper();
        const data = await auth.authCodeGrant(request.query.code);

        if("error" in data) throw new AuthLoginError();

        const { id, username, verified } = await auth.getUserInfo();

        if(!verified) throw new NotVerifiedEmailError();

        const user: Omit<MongoUser, "_id" | "userID" | "username"> | null = await request.server.database.users
            .findOne(
                {
                    userID: id
                },
                {
                    projection: {
                        _id: 0,
                        userID: 0,
                        username: 0
                    }
                }
            );

        const token = user?.token || utils.generateToken();

        await request.server.database.users
            .updateOne(
                {
                    userID: id
                },
                {
                    $set: {
                        token,
                        userID: id,
                        username: username,
                        cooldown: user?.cooldown ?? 0,
                        tag: user?.tag ?? null,
                        badges: user?.badges ?? [],
                        points: user?.points ?? 0,
                        role: user?.role ?? UserRole.User,
                    }
                },
                { upsert: true }
            );

        const cloudflareIpHeaders = request.headers['cf-connecting-ip'];
        LoggingHelper.sendLoginSuccess({
            userID: id,
            nickname: username,
            method: 'Discord',
            ip: cloudflareIpHeaders
                ? Array.isArray(cloudflareIpHeaders)
                    ? cloudflareIpHeaders[0]
                    : cloudflareIpHeaders
                : request.ip,
        });

        auth.joinPixelateitServer();

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
            .cookie('userid', id, params)
            .redirect(config.frontend);
    }
}