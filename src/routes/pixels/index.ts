import type { FastifyInstance } from "fastify";
import { getAll } from "./getAll";
import { getTags } from "./getTags";

export function pixels(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(getAll);
    app.route(getTags);

    done();
}
