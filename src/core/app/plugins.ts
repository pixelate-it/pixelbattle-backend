import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { config } from "@core/config";

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
});
