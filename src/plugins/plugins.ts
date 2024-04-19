import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCookie from "@fastify/cookie";
import fastifyUnderPressure from "@fastify/under-pressure";
import fastifyWebsocket from "@fastify/websocket";
import { RateLimitError } from "../apiErrors";
import { config } from "../config";

export const plugins = fp(async (app) => {
    await app.register(fastifyCors, {
        origin: config.frontend,
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        preflightContinue: false,
        hideOptionsRoute: true,
        hook: 'preHandler',
    });

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

    await app.register(fastifyCookie);

    await app.register(fastifyUnderPressure, {
        maxHeapUsedBytes: 2147483648,
        sampleInterval: 5000
    });

    await app.register(fastifyWebsocket, {
        options: {
            clientTracking: true
        }
    });

    return;
});