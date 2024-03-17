import { FastifyInstance } from "fastify";
import { discordCallback } from "./discordCallback";
import { googleCallback } from "./googleCallback";
import { twitchCallback } from "./twitchCallback";

export function login(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(discordCallback);
    app.route(googleCallback);
    app.route(twitchCallback);

    done();
}