import type { Filter } from "mongodb";
import type { MongoUser } from "models/MongoUser";
import { UserDataCache } from "models/UserDataCache";
import { BaseManager } from "./BaseManager";

export class UserManager extends BaseManager<MongoUser> {
    private readonly cache: UserDataCache[] = [];

    public async get(filter: Filter<MongoUser>) {
        let cachedUser = this.cache.find((u) =>
            (Object.keys(filter) as (keyof MongoUser)[])
                .map((key) => u.user[key] === filter[key])
                .reduce((acc, val) => acc && val)
        );

        if (cachedUser) {
            cachedUser.breath();

            return cachedUser;
        }

        const keys = Object.keys(filter);
        const databaseUser = await this.collection.findOne(filter, {
            projection: { _id: 0 },
            hint: {
                [keys.includes("userID")
                    ? "userID"
                    : keys.includes("token")
                    ? "token"
                    : "_id"]: 1
            }
        });

        if (databaseUser) {
            cachedUser = new UserDataCache(databaseUser);

            this.cache.push(cachedUser);
        }

        return cachedUser;
    }

    public async edit(
        filter: Partial<MongoUser>,
        value: Partial<MongoUser>,
        options?: { force: boolean }
    ) {
        const user = await this.get(filter);

        if (!user) {
            return null;
        }

        (Object.keys(value) as (keyof MongoUser)[])
            .filter((key) => value[key] !== undefined)
            .map((key) => user.set(key, value[key]!));

        const keys = Object.keys(filter);
        if (options?.force) {
            await this.collection.updateOne(
                filter,
                { $set: value },
                {
                    hint: {
                        [keys.includes("userID")
                            ? "userID"
                            : keys.includes("token")
                            ? "token"
                            : "_id"]: 1
                    }
                }
            );
        }

        return user;
    }

    public handle(checkInterval = 5000) {
        return setInterval(this.removeExpiredUsers.bind(this), checkInterval);
    }

    private removeExpiredUsers() {
        this.cache.map((user) => {
            if (user.expiresOn > Date.now()) {
                return;
            }

            const expiredUserIndex = this.cache.findIndex(
                (u) => u.user.userID === user.user.userID
            );
            this.cache.splice(expiredUserIndex, 1);
        });
    }
}
