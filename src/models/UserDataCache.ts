import type { MongoUser } from "models/MongoUser";
import { config } from "../config";

export class UserDataCache {
    private readonly _user: MongoUser;

    constructor(data: MongoUser) {
        this._user = data;

        this.breath();
    }

    private _expiresOn: number = 0;

    public get expiresOn() {
        return this._expiresOn;
    }

    public get user() {
        return this._user;
    }

    public set<T extends keyof MongoUser>(
        prop: T,
        val: MongoUser[T]
    ): MongoUser[T] {
        this._user[prop] = val;

        return val;
    }

    public breath() {
        this._expiresOn = Date.now() + config.expiresIn;
    }
}
