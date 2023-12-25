import fastifyPlugin from "fastify-plugin";
import { CanvasManager } from "../helpers/CanvasManager";
import { config } from "../config";
import { WithId } from "mongodb";
import { MongoGame } from "../models/MongoGame";

declare module "fastify" {
    interface FastifyInstance {
        game: WithId<MongoGame>
    }
}

export const game = fastifyPlugin(async (app) => {
    const game = await app.database.games.findOneAndUpdate({ id: 0 }, { $set: { id: 0, ...config.game } satisfies MongoGame }, { upsert: true})

    if (!game) {
        throw new Error("Can't find a game")
    }

    app.decorate("game", game)
})