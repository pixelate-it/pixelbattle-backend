const { pixel: pixelSchema } = require('../extra/Schemas');

class CanvasManager {
    #ready;
    #pixels;

    constructor() {
        this.#ready = false;
        this.#pixels = [];
    }

    async init(collection) {
        this.#pixels = await collection
            .find({}, { projection: { _id: 0 } })
            .toArray();

        this.#ready = true;
        return this.#pixels;
    }

    async #sendPixels(collection) {
        if(!this.#pixels.length) throw new Error(`The class ${this.constructor.name} is not currently initialized`);
        if(!this.#ready) throw new Error(`The class ${this.constructor.name} is currently already synchronizing`);

        this.#ready = false;
        await collection
            .updateMany(this.#pixels, { ordered: true });

        this.#ready = true;
        return this.#pixels;
    }

    get pixels() {
        if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized or is synchronizing (#ready must be true)`);
        return this.#pixels;
    }

    select({ x, y }) {
        if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized or is synchronizing (#ready must be true)`);
        return this.#pixels.find(pixel => (pixel.x === x && pixel.y === y));
    }

    paint({ x, y }, { color, author }) {
        if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized or is synchronizing (#ready must be true)`);
        const pixel = this.select({ x, y });
        if(!pixel) throw new Error(`Pixel with coordinates X${x} Y${y} does not exist`);
        if(!color) throw new Error('A pixel cannot be zero color');

        Object.keys(pixelSchema).map((arg) => (pixel[arg] = arguments[1][arg]));
        return pixel;
    }
}

module.exports = CanvasManager;