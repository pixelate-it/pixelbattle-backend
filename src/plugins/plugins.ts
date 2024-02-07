import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyUnderPressure from "@fastify/under-pressure";
import fastifyWebsocket from "@fastify/websocket";
import fp from "fastify-plugin";
import { RateLimitError } from "../errors";

export const plugins = fp(async (app) => {
    await app.register(fastifyCors, { origin: true });

    await app.register(fastifyFormbody);

    await app.register(fastifyRateLimit, {
        keyGenerator(req) {
            return Array.isArray(req.headers["cf-connecting-ip"])
                ? req.headers["cf-connecting-ip"][0]
                : req.headers["cf-connecting-ip"] ?? req.ip;
        },
        hook: 'preParsing',
        global: true,
        errorResponseBuilder(req, context) {
            return new RateLimitError(context.after);
        }
    });

    await app.register(fastifyUnderPressure, {
        maxHeapUsedBytes: 536870912,
        sampleInterval: 1000
    });

    await app.register(fastifyWebsocket, {
        options: {
            clientTracking: true
        }
    });

    return;
});