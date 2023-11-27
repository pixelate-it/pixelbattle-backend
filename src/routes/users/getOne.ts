import { FastifyRequest, RouteGenericInterface, RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Document } from "mongodb";
import { MongoUser } from "../../models/MongoUser";
import { EntityNotFoundError } from "../../errors";


export const getUser: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: { id: string }; }> = {
    method: 'GET',
    url: '/:id',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const user: Omit<MongoUser, "_id"> | null = await request.server.database.users.findOne(
            { 
                userID: request.params.id 
            }, 
            { 
                projection: {
                    _id: 0,
                    userID: 1,
                    cooldown: 1,
                    tag: 1,
                    username: 1,
                    role: 1,
                    isBanned: 1
                } 
            }
        );

        if (user === null) {
            throw new EntityNotFoundError("user");
        }

        return response.send({
            ...user,
            isMod: user.role === "MOD"
        })

        // if(!user) return response
        //     .code(404)
        //     .send({ error: true, reason: reasons[7] });

        // return response
        //     .send({ ...user, banned: parameters.bans.includes(request.params.id), isMod: parameters.moderators.includes(request.params.id) });
    }
}