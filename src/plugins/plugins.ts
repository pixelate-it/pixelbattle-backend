import fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyUnderPressure from "@fastify/under-pressure";
import fastifyWebsocket from "@fastify/websocket";
import fp from "fastify-plugin"
import { ApiErrorResponse } from "../types/ApiReponse";
import { RateLimitError } from "../errors";

export const plugins = fp(async (app) => {
    await app.register(fastifyCors, { origin: "*", credentials: true })

    await app.register(fastifyFormbody)

    await app.register(fastifyRateLimit, {
        keyGenerator(req) {
            return req.ip ?? req.headers["cf-connecting-ip"]
        },
        hook: 'preParsing',
        global: true,
        errorResponseBuilder(req, context) {
            const error = new RateLimitError(context.after)

            return error
        },
        
    })

    await app.register(fastifyUnderPressure, {
        maxHeapUsedBytes: 536870912,
        sampleInterval: 1000
    })

    await app.register(fastifyWebsocket, {
        options: {
            clientTracking: true
        }
    });

    return
})