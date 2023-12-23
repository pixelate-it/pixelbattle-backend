const { pixel: pixelSchema } = require('../extra/Schemas');

class CanvasManager {
    #ready;
    #pixels;
    #changes;
    width;
    height;

    constructor(collection) {
        this.collection = collection;
        this.#ready = false;
        this.#pixels = [];
        this.#changes = [];
    }

    async init(width, height) {
        this.#pixels = await this.collection
            .find({}, { projection: { _id: 0 } })
            .toArray();
        this.#pixels = this.#pixels.sort((a, b) => a.x - b.x).sort((a, b) => a.y - b.y)

        this.width = width;
        this.height = height;

        this.#ready = true;
        return this.#pixels;
    }

    async sendPixels() {
        if(!this.#pixels.length) throw new Error(`The class ${this.constructor.name} is not currently initialized`);

        this.#changes.map((pixel) => this.collection.updateOne({ x: pixel.x, y: pixel.y }, { $set: { ...this.select({ x: pixel.x, y: pixel.y }) } }));
        this.#changes = [];

        return this.pixels;
    }

    async clear(color = "#FFFFFF") {
        if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized (#ready must be true)`);

        this.#ready = false;
        this.#changes = [];
        const pixels = new Array(this.width * this.height).fill(0)
        .map((_, i) => ({ x: i % this.width, y: Math.floor(i / this.width), color, author: null, tag: null }));

        await this.collection.drop();
        await this.collection.insertMany(pixels, { ordered: true });
        this.#ready = true;

        return this.#pixels = pixels;
    }

    get pixels() {
        if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized (#ready must be true)`);
        return this.#pixels;
    }

    select({ x, y }) {
        return this.pixels.find(pixel => ((pixel.x === x) && (pixel.y === y)));
    }

    paint({ x, y }, { color, author }) {
        if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized (#ready must be true)`);
        const pixel = this.select({ x, y });
        if(!pixel) throw new Error(`Pixel with coordinates X${x} Y${y} does not exist`);
        if(!color) throw new Error('A pixel cannot be zero color');

        Object.keys(pixelSchema).map((arg) => (pixel[arg] = arguments[1][arg]));
        this.#changes.push({ x, y })
        return pixel;
    }
}

module.exports = CanvasManager;