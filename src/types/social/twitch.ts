export type TwitchType = "admin" | "global_mod" | "staff" | "";
export type TwitchBroadcasterType = "affiliate" | "partner" | "";

export interface TwitchUser {
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
