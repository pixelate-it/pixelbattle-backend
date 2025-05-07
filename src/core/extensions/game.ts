import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { WithId } from "mongodb";
import type { MongoGame } from "@models";
import { config } from "@core/config";

declare module "fastify" {
    interface FastifyInstance {
        game: WithId<MongoGame>;
    }
}

export const game = fp(async function game(app: FastifyInstance) {
    const game =
        (await app.database.games.findOne({ id: 0 }, { hint: { id: 1 } })) ??
        (await app.database.games
            .insertOne({ id: 0, ...config.game })
            .then((r) => app.database.games.findOne({ _id: r.insertedId })));

    app.decorate("game", game!);
});
