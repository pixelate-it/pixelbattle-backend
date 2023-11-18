const { v4: uuidv4 } = require('uuid');

module.exports = {
    generateToken(date = null) {
        const token = `${uuidv4()}.${(date ?? Date.now()).toString(36)}.${uuidv4()}`
        return token; // на данный момент у токена фиксированная длинна 82 символа!
    },
    translateHex(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return [255, b, g, r];
    }
}