import type { MongoUser } from "@models";

export class UserCache {
    private _expiresOn: number = 0;

    constructor(
        public data: MongoUser,
        private ttl: number
    ) {
        this.refresh();
    }

    public get expiresOn() {
        return this._expiresOn;
    }

    public set<T extends keyof MongoUser>(
        prop: T,
        val: MongoUser[T]
    ): MongoUser[T] {
        this.data[prop] = val;
        this.refresh();

        return val;
    }

    public refresh() {
        this._expiresOn = Date.now() + this.ttl;
    }
}
