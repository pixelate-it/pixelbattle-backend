import { FastifyInstance } from "fastify";
import fastifyMongodb from "@fastify/mongodb"
import { config } from "../config";
import fp from "fastify-plugin"
import { PixelDatabaseCollections, createDatabaseMap } from "../extra/databaseMap";

declare module 'fastify' {
    interface FastifyInstance {
        database: PixelDatabaseCollections
    }
}

export const database = fp(async (app: FastifyInstance, _) => {
    await app.register(fastifyMongodb, {
        forceClose: true,
        url: config.database
    })


    if (!app.mongo.db) {
        throw new Error("Can't connect to the database")
    }

    app.decorate("database", createDatabaseMap(app.mongo.db))

    return
})