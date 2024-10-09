import type { FastifyInstance } from "fastify";
import { discordCallback } from "./discordCallback";
import { googleCallback } from "./googleCallback";
import { twitchCallback } from "./twitchCallback";
import { githubCallback } from "./githubCallback";
import { config } from "config";

export function login(app: FastifyInstance, _: unknown, done: () => void) {
    if (config.discord.bot.id) app.route(discordCallback);
    if (config.google.id) app.route(googleCallback);
    if (config.twitch.id) app.route(twitchCallback);
    if (config.github.id) app.route(githubCallback);

    done();
}
