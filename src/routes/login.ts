import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { AuthHelper } from "../helpers/AuthHelper";
import { MongoUser } from "../models/MongoUser";
import { utils } from "../extra/Utils";
import { config } from "../config";


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
        // const code = request.query.code;
        // if(!code) return response
        //     .code(400)
        //     .send({ error: true, reason: 'Please return to the login page and try again' });

        const auth = new AuthHelper();

        const data = await auth.authCodeGrant(request.query.code);

        if ("error" in data) return response
            .code(400)
            .send({ error: true, reason: 'Please return to the login page and try again' });

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
                        role: "USER",

                    }
                },
                { upsert: true }
            );

        auth.joinPixelateitServer();

        return response
            .redirect(`${config.frontend}/?token=${token}&id=${id}`);
    }
}