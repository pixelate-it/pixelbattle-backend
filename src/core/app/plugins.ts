import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCookie from "@fastify/cookie";
import fastifyWebsocket from "@fastify/websocket";
import { getIpAddress } from "@utils";
import { RateLimitError } from "@core/errors";
import { config } from "@core/config";

export const plugins = fp(
    async function plugins(app: FastifyInstance) {
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
            keyGenerator: (request) => getIpAddress(request),
            hook: "preParsing",
            global: true,
            errorResponseBuilder(_req, context) {
                return new RateLimitError(context.after);
            }
        });

        await app.register(fastifyCookie);

        await app.register(fastifyWebsocket, {
            //errorHandler: websocketErrorHandler,
            options: {
                clientTracking: true,
                maxPayload: 1024
            }
        });
    },
    { name: "plugins", dependencies: [] }
);
