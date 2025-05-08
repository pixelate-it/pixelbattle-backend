export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar?: string;
    bot?: string;
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: string;
    accent_color?: number;
}
