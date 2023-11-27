import { Collection } from "mongodb";
import { MongoPixel } from "../models/MongoPixel";

// const { pixel: pixelSchema } = require('../extra/Schemas');
class CanvasManager {
    private ready = false
    private pixels: MongoPixel[] = [];
    private changes: Point[];
    private collection: Collection<MongoPixel>;

    constructor(collection: Collection<MongoPixel>) {
        this.collection = collection;
        this.ready = false;
        this.pixels = [];
        this.changes = [];
    }

    async init() {
        this.pixels = await this.collection
            .find({}, { projection: { _id: 0 } })
            .toArray();

        this.ready = true;

        return this.pixels;
    }

    async sendPixels() {
        // if(!this.#pixels.length) throw new Error(`The class ${this.constructor.name} is not currently initialized`);

        this.changes.forEach((pixel) => this.collection.updateOne({ x: pixel.x, y: pixel.y }, { $set: { ...this.select({ x: pixel.x, y: pixel.y }) } }));
        this.changes = [];

        return this.pixels;
    }

    // get pixels() {
    //     if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized (#ready must be true)`);
    //     return this.#pixels;
    // }

    select({ x, y }: Point) {
        return this.pixels.find(pixel => ((pixel.x === x) && (pixel.y === y)));
    }

    paint({ x, y }: Point) {
        // if(!this.#ready) throw new Error(`The class ${this.constructor.name} is not initialized (#ready must be true)`);
        const pixel = this.select({ x, y });

        // if(!pixel) throw new Error(`Pixel with coordinates X${x} Y${y} does not exist`);
        // if(!color) throw new Error('A pixel cannot be zero color');

        // Object.keys(pixelSchema).map((arg) => (pixel[arg] = arguments[1][arg]));
        this.changes.push({ x, y })
        return pixel;
    }
}

interface Point {
    x: number;
    y: number;
}

module.exports = CanvasManager;