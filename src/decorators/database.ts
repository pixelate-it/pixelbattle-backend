import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyMongodb from "@fastify/mongodb";
import {
    createDatabaseMap,
    type PixelDatabaseCollections
} from "utils/databaseMap";
import { config } from "config";

declare module "fastify" {
    interface FastifyInstance {
        database: PixelDatabaseCollections;
    }
}

export const database = fp(async function database(app: FastifyInstance) {
    await app.register(fastifyMongodb, {
        retryWrites: true,
        readPreference: "primaryPreferred",
        compressors: ["zlib"],
        zlibCompressionLevel: 4,
        forceClose: true,
        url: config.database
    });

    if (!app.mongo.db) {
        throw new Error("Can't connect to the database");
    }

    app.decorate("database", createDatabaseMap(app.mongo.db));
});
