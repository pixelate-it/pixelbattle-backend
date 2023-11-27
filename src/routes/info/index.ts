import { FastifyInstance } from "fastify";
import { get } from "./get";

export function info(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(get)

    done()
}