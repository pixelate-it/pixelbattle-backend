type TwitchType = "admin" | "global_mod" | "staff" | "";
type TwitchBroadcasterType = "affiliate" | "partner" | "";

interface DiscordUser {
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

interface GoogleUser {
    id: string;
    email?: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name?: string;
    picture?: string;
    locale: string;
}

interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    type: TwitchType;
    broadcaster_type: TwitchBroadcasterType;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at: string;
}

interface GithubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    hireable: boolean | null;
    bio: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}