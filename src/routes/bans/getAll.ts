import { RouteOptions } from "fastify";
import { MongoUser } from "../../models/MongoUser";


export const getAll: RouteOptions = ({
    method: 'GET',
    url: '/',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '3s'
        }
    },
    async handler(request, response) {
        const bans: Pick<MongoUser, "userID">[] = await request.server.database.users.find({
            banned: {
                "$exists": true,
                "$ne": null
            }
        },
            {
                projection: {
                    _id: 0,
                    userID: 1
                }
            }).toArray()

        return response
            .code(200)
            .send({ bans: bans.map(b => b.userID) });
    }
});