import { Filter } from "mongodb";
import { MongoUser } from "../models/MongoUser";
import { UserDataCache } from "../extra/UserDataCache";
import { BaseManager } from "./BaseManager";

export class UserManager extends BaseManager<MongoUser>{
    private cache: UserDataCache[] = [];

    public async get(filter: Filter<MongoUser>) {
        // Find the user in cache with same keys as argument passed
        let cachedUser = this.cache
            .find(u => (Object
                .keys(filter) as (keyof MongoUser)[])
                .map((key) => u.user[key] === filter[key])
                .reduce((acc, val) => acc && val));

        if(cachedUser) {
            cachedUser.breath();

            return cachedUser;
        }

        const databaseUser = await this.collection.findOne(filter);

        if(databaseUser) {
            cachedUser = new UserDataCache(databaseUser);

            this.cache.push(cachedUser);
        }

        return cachedUser;
    }


    public async edit(filter: Partial<MongoUser>, value: Partial<MongoUser>, options?: { force: boolean }) {
        const user = await this.get(filter);

        if(!user) {
            return null;
        }

        // replace the cached user with value
        (Object.keys(value) as (keyof MongoUser)[])
            .filter(key => value[key] !== undefined)
            .map(key => user.set(key, value[key]!));

        if(options?.force) {
            await this.collection.updateOne(filter, { $set: value });
        }

        return user;
    }

    private removeExpiredUsers() {
        this.cache.map((user) => {
            if(user.expiresOn > Date.now()) {
                return;
            }

            const expiredUserIndex = this.cache.findIndex(u => u.user.userID === user.user.userID);
            this.cache.splice(expiredUserIndex, 1); // remove expired user from cache
        });
    }


    public handle(checkInterval = 5000) {
        return setInterval(this.removeExpiredUsers.bind(this), checkInterval);
    }
}
