import { Collection } from "mongodb";
import { MongoUser } from "../models/MongoUser";
import { UserDataCache } from "../extra/UserDataCache";

export class UserManager {
    private collection: Collection<MongoUser>;
    private cache: Array<UserDataCache>;

    constructor(collection: Collection<MongoUser>) {
        this.collection = collection;
        this.cache = [];
    }

    public async get(filter: Partial<MongoUser>) {
        // Find the user in cache with same keys as argument passed
        let cachedUser = this.cache
            .find(u => (Object
                .keys(filter) as (keyof MongoUser)[])
                .map((key) => u.user[key] === filter[key])
                .reduce((acc, val) => acc && val));

        if (cachedUser) {
            cachedUser.breath();

            return cachedUser;
        }

        const databaseUser = await this.collection.findOne(filter);

        if (databaseUser) {
            cachedUser = new UserDataCache(databaseUser);

            this.cache.push(cachedUser);
        }


        return cachedUser;
    }


    public async edit(filter: Partial<MongoUser>, value: Partial<MongoUser>, options?: { force: boolean }) {
        const user = await this.get(filter);

        if (!user) {
            return null;
        }

        // replace the cached user with value
        (Object.keys(value) as (keyof MongoUser)[])
            .filter(key => value[key] !== undefined)
            .map(key => user.set(key, value[key]!));

        if (options?.force) {
            this.collection.updateOne(value, { $set: value });
        }

        return user;
    }


    public handle(checkInterval = 5000) {
        const removeExpiredUsers = () => {
            this.cache.map((user) => {
                if (user.expiresOn > performance.now()) {
                    return
                }

                const expiredUserIndex = this.cache.findIndex(u => u.user.userID === user.user.userID)
                this.cache.splice(expiredUserIndex, 1); // remove expired user from cache
            });
        }

        return setInterval(removeExpiredUsers, checkInterval);
    }
}
