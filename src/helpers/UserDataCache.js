class UserDataCache {
    #expiresOn;
    constructor(data) {
        this.token = data.token;
        this.userID = data.userID;
        this.username = data.username;
        this.cooldown = data.cooldown;
        this.tag = data.tag;

        this.breath();
    }

    get expiresOn() {
        return this.#expiresOn;
    }

    set(prop, val) {
        return this[prop] = val;
    }

    breath() {
        this.#expiresOn = Date.now() + parseInt(process.env.expiresIn || 300) * 1000;
    }
}

module.exports = UserDataCache;