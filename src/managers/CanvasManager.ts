import { Collection } from "mongodb";
import { MongoPixel } from "../models/MongoPixel";
import { BaseManager } from "./BaseManager";

interface Point {
    x: number;
    y: number;
}


export class CanvasManager extends BaseManager<MongoPixel>{
    private _pixels: MongoPixel[] = [];
    private changes: Point[];
    private width: number = 0;
    private height: number = 0;

    constructor(collection: Collection<MongoPixel>) {
        super(collection);

        this._pixels = [];
        this.changes = [];
    }

    public get pixels() {
        return this._pixels;
    }

    public async init(width: number, height: number) {
        this._pixels = await this.collection
            .find({}, { projection: { _id: 0 } })
            .toArray();

        this.width = width;
        this.height = height;

        return this._pixels;
    }

    public async sendPixels() {
        const bulk = this.changes.map((pixel) => ({
            updateOne: {
                filter: { x: pixel.x, y: pixel.y },
                update: { $set: this.select({ x: pixel.x, y: pixel.y }) },
                hint: { x: 1, y: 1 }
            }
        }));

        if(bulk.length) await this.collection.bulkWrite(bulk);

        this.changes = [];
        return this._pixels;
    }

    public select({ x, y }: Point) {
        return this._pixels.find(pixel => ((pixel.x === x) && (pixel.y === y)));
    }

    public async clear(color: string) {
        this.changes = [];

        const pixels = new Array(this.width * this.height)
            .fill(0)
            .map((_, i) => ({
                x: i % this.width,
                y: Math.floor(i / this.width),
                color,
                author: null,
                tag: null
            }));

        await this.collection.drop();
        await this.collection.insertMany(pixels, { ordered: true });

        this._pixels = pixels;

        return pixels;
    }

    public paint(pixel: MongoPixel) {
        const canvasPixel = this.select({ x: pixel.x, y: pixel.y });

        if(!canvasPixel) return;

        canvasPixel.author = pixel.author;
        canvasPixel.color = pixel.color;
        canvasPixel.tag = pixel.tag;

        this.changes.push({ x: pixel.x, y: pixel.y })

        return pixel;
    }
}




