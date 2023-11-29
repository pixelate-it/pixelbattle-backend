import { FastifyInstance } from "fastify";
import fastifyMongodb from "@fastify/mongodb"
import { Collection } from "mongodb";
import { MongoPixel } from "../models/MongoPixel";
import { MongoUser } from "../models/MongoUser";
import { config } from "../config";
import fp from "fastify-plugin"


interface PixelDatabase {
    users: Collection<MongoUser>;
    pixels: Collection<MongoPixel>;
}

declare module 'fastify' {
    interface FastifyInstance {
        database: PixelDatabase;
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


    app.decorate("database", ({
        users: app.mongo.db.collection<MongoUser>("users"),
        pixels: app.mongo.db.collection<MongoPixel>("pixels"),
    }))

    return
})