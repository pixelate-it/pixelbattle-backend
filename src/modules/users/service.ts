import type { MongoUser } from "@models";
import type { UserRepository } from "./repository";
import type { UserFilter } from "./types";
import { UserCache } from "./cache";

export class UserService {
    private cached: UserCache[] = [];
    private cleanupInterval?: Timer;

    constructor(
        private repository: UserRepository,
        private TTL = 5 * 60 * 1000 // 5 minutes
    ) {}

    async get(filter: UserFilter) {
        const cached = this.peak(filter);
        if (cached) {
            cached.refresh();
            return cached.data;
        }

        const user = await this.repository.findOne(filter);
        if (!user) return null;

        const cache = new UserCache(user, this.TTL);
        this.cached.push(cache);

        return user;
    }

    async edit(
        filter: UserFilter,
        update: Omit<Partial<MongoUser>, "id">,
        options?: { upsert?: boolean }
    ) {
        const cached = this.peak(filter);
        if (cached) {
            Object.entries(update).forEach(([key, value]) =>
                cached.set(key as keyof MongoUser, value)
            );
        }

        if (options?.upsert !== false) {
            await this.repository.updateOne(filter, update, {
                upsert: options?.upsert
            });
        }

        return cached?.data ?? (await this.get(filter));
    }

    startAutoCleanup(interval = 5000) {
        this.cleanupInterval = setInterval(
            () => this.cleanupExpired(),
            interval
        );
    }

    private peak(filter: UserFilter) {
        return this.cached.find((cache) =>
            Object.entries(filter).every(
                ([k, v]) => cache.data[k as keyof MongoUser] === v
            )
        );
    }

    private cleanupExpired() {
        this.cached = this.cached.filter((u) => Date.now() > u.expiresOn);
    }

    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
}
