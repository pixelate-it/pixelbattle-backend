import type { FastifyInstance } from "fastify";
import { byRoutes } from "./by-";

export function userRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(byRoutes, { prefix: "/by-" });

    done();
}
