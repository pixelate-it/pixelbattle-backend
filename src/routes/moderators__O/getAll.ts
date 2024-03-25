import { RouteOptions } from "fastify";
import { MongoUser } from "../../models/MongoUser";
import { UserRole } from "../../models/MongoUser";


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
        return response
            .code(418)
            .send({ error: false, reason: "i don't like being looked at, turn off the light!" });
    }
});