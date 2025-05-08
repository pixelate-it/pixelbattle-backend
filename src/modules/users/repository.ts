import { BaseRepository } from "@core/database";
import type { MongoUser } from "@models";
import type { UserFilter } from "./types";

export class UserRepository extends BaseRepository<MongoUser> {
    async findOne(filter: UserFilter) {
        return this.collection.findOne(filter, { projection: { _id: 0 } });
    }

    async updateOne(
        filter: UserFilter,
        update: Omit<Partial<MongoUser>, "id">,
        options?: { upsert?: boolean }
    ) {
        const keys = Object.keys(filter);

        return this.collection.updateOne(
            filter,
            { $set: update },
            { hint: this.getIndexHint(keys), upsert: options?.upsert }
        );
    }

    private getIndexHint(keys: string[]) {
        if (keys.includes("userID")) return { userID: 1 };
        if (keys.includes("token")) return { token: 1 };
        return { _id: 1 };
    }
}
