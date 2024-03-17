import { config as dotenvConfig } from "dotenv";
import { join } from "path";

dotenvConfig({ path: join(__dirname, '../.env') });

export const config = {
    database: process.env.DATABASE,
    discord: {
        bot: {
            token: process.env.DISCORD_BOT_TOKEN!,
            id: process.env.DISCORD_BOT_ID!,
            secret: process.env.DISCORD_BOT_SECRET!
        },
        guildId: process.env.DISCORD_GUILD_ID!,
    },
    google: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!
    },
    twitch: {
        id: process.env.TWITCH_CLIENT_ID!,
        secret: process.env.TWITCH_CLIENT_SECRET!
    },
    game: {
        name: "Test",
        ended: false,
        cooldown: 300,
        height: 80,
        width: 160,
    },
    expiresIn: 30000,
    syncTime: 15000,
    moderatorCooldown: 50,
    frontend: process.env.FRONTEND_URL!,
    redirectUri: process.env.REDIRECT!
}