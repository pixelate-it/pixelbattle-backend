import { FastifyInstance } from "fastify";
import { discordCallback } from "./discordCallback";

export function login(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(discordCallback);

    done();
}