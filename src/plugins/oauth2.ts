import fp from "fastify-plugin";
import { fastifyOauth2, OAuth2Namespace } from "@fastify/oauth2";
import { config } from "../config";

declare module 'fastify' {
    interface FastifyInstance {
        discordOauth2: OAuth2Namespace;
        googleOauth2: OAuth2Namespace;
        twitchOauth2: OAuth2Namespace;
    }
}

export const oauth2 = fp(async(app) => {
    app.register(fastifyOauth2, {
        name: 'discordOauth2',
        scope: ['identify', 'guilds.join', 'email'],
        credentials: {
            auth: fastifyOauth2.DISCORD_CONFIGURATION,
            client: {
                id: config.discord.bot.id,
                secret: config.discord.bot.secret
            }
        },
        cookie: {
            secure: true,
            sameSite: 'lax'
        },
        startRedirectPath: '/login/discord',
        callbackUri: config.redirectUri + '/login/discord/callback'
    });

    app.register(fastifyOauth2, {
        name: 'googleOauth2',
        scope: ['profile', 'email'],
        credentials: {
            client: {
                id: config.google.id,
                secret: config.google.secret
            },
            auth: fastifyOauth2.GOOGLE_CONFIGURATION
        },
        cookie: {
            secure: true
        },
        startRedirectPath: '/login/google',
        callbackUri: config.redirectUri + '/login/google/callback',
        callbackUriParams: {
            access_type: 'offline'
        }
    });

    app.register(fastifyOauth2, {
        name: 'twitchOauth2',
        scope: ['user:read:email'],
        credentials: {
            client: {
                id: config.twitch.id,
                secret: config.twitch.secret
            },
            auth: fastifyOauth2.TWITCH_CONFIGURATION
        },
        cookie: {
            secure: true
        },
        startRedirectPath: '/login/twitch',
        callbackUri: config.redirectUri + '/login/twitch/callback',
        tokenRequestParams: {
            client_id: config.twitch.id,
            client_secret: config.twitch.secret
        }
    });

    return;
});