import type { FastifyInstance } from "fastify";
import { get } from "./get.route";

export function gameRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(get);

    done();
}
