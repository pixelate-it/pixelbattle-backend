const UserDataCache = require('./UserDataCache');

class UserManager {
    collection;
    #cache;

    constructor(collection) {
        this.collection = collection;
        this.#cache = [];
    }

    async get({}) {
        if(!arguments.length) return null;
        let user = this.#cache.find(u => Object.keys(arguments[0]).map(key => u[key] === arguments[0][key]).reduce((acc, val) => acc && val));
        if(user) {
            user.breath();
            return user;
        }

        user = await this.collection.findOne(arguments[0], { projection: { _id: 0, token: 1, userID: 1, username: 1, cooldown: 1, tag: 1 } });
        if(user) user = new UserDataCache(user);

        this.#cache.push(user);
        return user;
    }

    async edit({}, {}) {
        const user = await this.get(arguments[0]);
        if(!user) return null;

        Object.keys(arguments[1]).map(prop => user.set(prop, arguments[1][prop]));
        return user;
    }

    handle(checkInterval = 5000) {
        return setInterval(() => {
            this.#cache.map((user) => {
                if(user.expiresOn <= Date.now()) this.#cache.splice(this.#cache.findIndex(u => u.id === user.id), 1);
            });
        }, checkInterval);
    }
}

module.exports = UserManager;