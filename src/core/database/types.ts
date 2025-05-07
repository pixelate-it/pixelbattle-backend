import type { Collection } from "mongodb";
import type { MongoGame } from "@models";
import type { MongoPixel } from "@models";
import type { MongoUser } from "@models";
import type { MongoIp } from "@models";

export interface PixelDatabase {
    users: MongoUser;
    pixels: MongoPixel;
    games: MongoGame;
    banned_ips: MongoIp;
}

export type PixelDatabaseCollections = {
    [K in keyof PixelDatabase]: Collection<PixelDatabase[K]>;
};
