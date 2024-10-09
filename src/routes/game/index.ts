import type { FastifyInstance } from "fastify";
import { get } from "./get";

export function game(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(get);

    done();
}
