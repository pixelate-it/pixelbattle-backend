import type { CollectionOptions, Collection, Db } from "mongodb";
import type { MongoGame } from "../models/MongoGame";
import type { MongoPixel } from "../models/MongoPixel";
import type { MongoUser } from "../models/MongoUser";
import type { MongoIp } from "../models/MongoIp";

declare module "mongodb" {
    interface Db {
        collection<K extends keyof PixelDatabase>(
            name: K,
            options?: CollectionOptions | undefined
        ): Collection<PixelDatabase[K]>;
    }
}

export interface PixelDatabase {
    users: MongoUser;
    pixels: MongoPixel;
    games: MongoGame;
    banned_ips: MongoIp;
}

export type PixelDatabaseCollections = {
    [K in keyof PixelDatabase]: Collection<PixelDatabase[K]>;
};

export function createDatabaseMap(database: Db) {
    const keys: (keyof PixelDatabase)[] = [
        "games",
        "pixels",
        "users",
        "banned_ips"
    ];

    return Object.fromEntries(
        keys.map((key) => [key, database.collection(key)])
    ) as PixelDatabaseCollections;
}
