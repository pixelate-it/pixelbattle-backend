import type { RouteOptions } from "fastify";
import { type MongoUser, UserRole } from "../../models/MongoUser";

export const getAll: RouteOptions = {
    method: "GET",
    url: "/",
    config: {
        rateLimit: {
            max: 2,
            timeWindow: 3000
        }
    },
    async handler(request, response) {
        const moderators: Pick<MongoUser, "userID">[] =
            await request.server.database.users
                .find(
                    {
                        role: {
                            $gte: UserRole.Moderator
                        }
                    },
                    {
                        projection: {
                            _id: 0,
                            userID: 1
                        }
                    }
                )
                .toArray();

        return response
            .code(200)
            .send({ moderators: moderators.map((m) => m.userID) });
    }
};
