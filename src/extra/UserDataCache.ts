import { config } from "../config";
import { MongoUser } from "../models/MongoUser";

export class UserDataCache {
    private _expiresOn: number = 0;
    private _user: MongoUser;
    
    constructor(data: MongoUser) {
        this._user = data

        this.breath();
    }


    public get expiresOn() {
        return this._expiresOn;
    }

    public get user() {
        return this._user;
    }

    public set<T extends keyof MongoUser>(prop: T, val: MongoUser[T]): MongoUser[T] {
        this._user[prop] = val;

        return val;
    }

    public breath() {
        this._expiresOn = Date.now() + config.expiresIn;
    }
}
