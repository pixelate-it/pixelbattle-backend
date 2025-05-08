import type { FastifyInstance } from "fastify";
import { getAll } from "./get-all.route";
import { getOne } from "./get-one.route";
import { getTags } from "./get-tags.route";

export function canvasRoutes(
    app: FastifyInstance,
    _: unknown,
    done: () => void
) {
    app.route(getAll);
    app.route(getOne);
    app.route(getTags);

    done();
}
