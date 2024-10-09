export const config = {
    database: import.meta.env.DATABASE!,
    cloudflare: {
        token: import.meta.env.CLOUDFLARE_API_TOKEN!,
        email: import.meta.env.CLOUDFLARE_EMAIL!,
        id: import.meta.env.CLOUDFLARE_ACCOUNT_ID!,
        list_id: import.meta.env.CLOUDFLARE_LIST_ID!
    },
    discord: {
        bot: {
            token: import.meta.env.DISCORD_BOT_TOKEN!,
            id: import.meta.env.DISCORD_BOT_ID!,
            secret: import.meta.env.DISCORD_BOT_SECRET!
        },
        guildId: import.meta.env.DISCORD_GUILD_ID!
    },
    google: {
        id: import.meta.env.GOOGLE_CLIENT_ID!,
        secret: import.meta.env.GOOGLE_CLIENT_SECRET!
    },
    twitch: {
        id: import.meta.env.TWITCH_CLIENT_ID!,
        secret: import.meta.env.TWITCH_CLIENT_SECRET!
    },
    github: {
        id: import.meta.env.GITHUB_CLIENT_ID!,
        secret: import.meta.env.GITHUB_CLIENT_SECRET!
    },
    game: {
        name: "Pixelate It!",
        ended: false,
        cooldown: 500,
        height: 100,
        width: 100
    },
    expiresIn: 30000,
    syncTime: 15000,
    moderatorCooldown: 50,
    frontend: import.meta.env.FRONTEND_URL!,
    redirectUri: import.meta.env.REDIRECT!
};
