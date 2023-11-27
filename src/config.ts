import { config as dotenvConfig } from "dotenv"

dotenvConfig()

export const config = {
    database: process.env.DATABASE,
    discord: {
        bot: {
            token: process.env.DISCORD_BOT_TOKEN!,
            id: process.env.DISCORD_BOT_ID!,
            secret: process.env.DISCORD_BOT_SECRET!,
            redirectUri: process.env.DISCORD_BOT_REDIRECT!
        },
        guildId: process.env.DISCORD_GUILD_ID!,

    },
    game: {
        name: "Test",
        ended: false,
        cooldown: 123,
        height: 80,
        width: 60,
    },
    frontend: process.env.FRONTEND_URL!
}