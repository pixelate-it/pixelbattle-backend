import type { FastifyInstance } from "fastify";
import { getAll } from "./get-all.route";

export function moderatorsRoutes(
    app: FastifyInstance,
    _: unknown,
    done: () => void
) {
    app.route(getAll);

    done();
}
