import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { CookieSerializeOptions } from "@fastify/cookie";
import { AuthHelper } from "../helpers/AuthHelper";
import { MongoUser } from "../models/MongoUser";
import { utils } from "../extra/Utils";
import { config } from "../config";
import { AuthLoginError } from "../errors";


export const login: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: { code: string }; }> = {
    method: 'GET',
    url: '/login',
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

        if("error" in data) {
            throw new AuthLoginError();
        }

        const { id, username } = await auth.getUserInfo();

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
                        role: 0,

                    }
                },
                { upsert: true }
            );

        auth.joinPixelateitServer();

        const params = {
            domain: config.frontend.split('//')[1].split(':')[0],
            path: '/',
            sameSite: 'none'
        } as CookieSerializeOptions;

        return response
            .cookie('token', token, params)
            .cookie('userid', id, params)
            .redirect(config.frontend);
    }
}