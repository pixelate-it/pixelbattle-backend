import type { Db } from "mongodb";
import type { PixelDatabase, PixelDatabaseCollections } from "./types";

declare module "mongodb" {
    interface Db {
        collection<K extends keyof PixelDatabase>(
            name: K,
            options?: CollectionOptions
        ): Collection<PixelDatabase[K]>;
    }
}

export function createDatabaseCollections(database: Db) {
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
