import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { rootRoutes } from "@modules/_root";

export const routes = fp(async function routes(app: FastifyInstance) {
    app.register(rootRoutes);
});
