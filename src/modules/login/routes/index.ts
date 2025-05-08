import type { FastifyInstance } from "fastify";
import { discordCallback } from "./discord-callback.route";
import { githubCallback } from "./github-callback.route";
import { googleCallback } from "./google-callback.route";
import { twitchCallback } from "./twitch-callback.route";
import { config } from "@core/config";

export function loginRoutes(
    app: FastifyInstance,
    _: unknown,
    done: () => void
) {
    if (config.discord.bot.id) app.route(discordCallback);
    if (config.github.id) app.route(githubCallback);
    if (config.google.id) app.route(googleCallback);
    if (config.twitch.id) app.route(twitchCallback);

    done();
}

export * from "./discord-callback.route";
export * from "./github-callback.route";
export * from "./google-callback.route";
export * from "./twitch-callback.route";
