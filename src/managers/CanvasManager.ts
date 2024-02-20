import { Collection } from "mongodb";
import { MongoPixel, MongoPixelInternal } from "../models/MongoPixel";
import { BaseManager } from "./BaseManager";
import { utils } from "../extra/Utils";
import * as util from "util";

interface Point {
    x: number;
    y: number;
}


export class CanvasManager extends BaseManager<MongoPixel>{
    private _pixels: MongoPixelInternal[] = [];
    private changes: Point[];

    constructor(collection: Collection<MongoPixel>, readonly width: number, readonly height: number) {
        super(collection);

        this._pixels = [];
        this.changes = [];
    }

    public get pixels() {
        return this._pixels;
    }

    public async init() {
        this._pixels = await this.collection
            .find({}, { projection: { _id: 0 } })
            .toArray()
            .then(pixels =>
                pixels.map((pixel) => ({
                    ...pixel,
                    color: utils.translateHex(pixel.color)
                }))
            );

        return this._pixels;
    }

    public async sendPixels() {
        const bulk = this.changes.map((pixel) => {
            const data = this.select({ x: pixel.x, y: pixel.y })!;
            return {
                updateOne: {
                    filter: { x: pixel.x, y: pixel.y },
                    update: { $set: { ...data, color: utils.translateRGB(data.color) } },
                    hint: { x: 1, y: 1 }
                }
            }
        });

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

        const RGB = utils.translateHex(color);
        this._pixels = pixels.map(pixel => ({ ...pixel, color: RGB }));

        return pixels;
    }

    public paint(pixel: MongoPixel) {
        const canvasPixel = this.select({ x: pixel.x, y: pixel.y });

        if(!canvasPixel) return;

        canvasPixel.color = utils.translateHex(pixel.color);
        canvasPixel.author = pixel.author;
        canvasPixel.tag = pixel.tag;

        this.changes.push({ x: pixel.x, y: pixel.y })

        return pixel;
    }
}




