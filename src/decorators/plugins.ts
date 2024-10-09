import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCookie from "@fastify/cookie";
import fastifyWebsocket from "@fastify/websocket";
import { websocketErrorHandler } from "./errorHandler";
import { RateLimitError } from "utils/templateHttpError";
import { config } from "config";

export const plugins = fp(async function plugins(app: FastifyInstance) {
    await app.register(fastifyCors, {
        origin: config.frontend,
        credentials: true,
        methods: ["GET", "PUT", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        preflightContinue: false,
        hideOptionsRoute: true,
        hook: "preHandler"
    });

    await app.register(fastifyFormbody);

    await app.register(fastifyRateLimit, {
        keyGenerator(req) {
            return Array.isArray(req.headers["cf-connecting-ip"])
                ? req.headers["cf-connecting-ip"][0]
                : req.headers["cf-connecting-ip"] ?? req.ip;
        },
        hook: "preParsing",
        global: true,
        errorResponseBuilder(_req, context) {
            return new RateLimitError(context.after);
        }
    });

    await app.register(fastifyCookie);

    await app.register(fastifyWebsocket, {
        errorHandler: websocketErrorHandler,
        options: {
            clientTracking: true,
            maxPayload: 1024
        }
    });
});
