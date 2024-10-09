import type { Collection } from "mongodb";
import type { MongoPixel, Pixel } from "models/MongoPixel";
import { BaseManager } from "./BaseManager";
import { translateHex, translateRGB } from "utils/translate";

interface Point {
    x: number;
    y: number;
}

export class CanvasManager extends BaseManager<MongoPixel> {
    public readonly bitPP = 3;
    private changes: Point[];

    constructor(
        collection: Collection<MongoPixel>,
        readonly width: number,
        readonly height: number
    ) {
        super(collection);

        this._colors = new Uint8ClampedArray(width * height * this.bitPP);
        this._pixels = [];
        this.changes = [];
    }

    private _colors: Uint8ClampedArray;

    public get colors() {
        return this._colors;
    }

    private _pixels: Pixel[];

    public get pixels() {
        return this._pixels;
    }

    public async init() {
        const colors: number[][] = [];

        this._pixels = await this.collection
            .find({}, { projection: { _id: 0 }, hint: { x: 1, y: 1 } })
            .toArray()
            .then((pixels) =>
                pixels
                    .sort((a, b) => {
                        if (a.y !== b.y) return a.y - b.y;
                        return a.x - b.x;
                    })
                    .map((pixel) => {
                        const { color, ...pix } = pixel;

                        colors.push(translateHex(color));
                        return pix;
                    })
            );
        this._colors.set(colors.flat());

        return this._pixels;
    }

    public sendPixels() {
        const bulk = this.changes.map((pixel) => {
            const data = this.select({ x: pixel.x, y: pixel.y })!;
            return {
                updateOne: {
                    filter: { x: pixel.x, y: pixel.y },
                    update: {
                        $set: {
                            ...data,
                            color: this.getColor({ x: pixel.x, y: pixel.y })
                        }
                    },
                    hint: { x: 1, y: 1 }
                }
            };
        });

        if (bulk.length)
            this.collection.bulkWrite(bulk, {
                writeConcern: { w: "majority" }
            });

        this.changes = [];
        return this._pixels;
    }

    public select({ x, y }: Point) {
        return this._pixels.find((pixel) => pixel.x === x && pixel.y === y);
    }

    public async clear(color: string) {
        const colors: number[][] = [];
        const RGB = translateHex(color);
        const pixels = new Array(this.width * this.height)
            .fill(0)
            .map((_, i) => {
                colors.push(RGB);

                return {
                    x: i % this.width,
                    y: Math.floor(i / this.width),
                    author: null,
                    tag: null
                };
            });

        await this.collection.drop();
        await this.collection.createIndex({ x: 1, y: 1 });
        await this.collection.insertMany(
            pixels.map((pixel) => ({ ...pixel, color })),
            { ordered: true }
        );

        this.changes = [];
        this._pixels = pixels;
        this._colors = new Uint8ClampedArray(colors.flat());

        return pixels;
    }

    public paint(pixel: MongoPixel) {
        const canvasPixel = this.select({ x: pixel.x, y: pixel.y });

        if (!canvasPixel) return;

        this.setColor({ x: pixel.x, y: pixel.y }, pixel.color);
        canvasPixel.author = pixel.author;
        canvasPixel.tag = pixel.tag;

        this.changes.push({ x: pixel.x, y: pixel.y });

        return pixel;
    }

    public getColor({ x, y }: Point) {
        const index = this.startIndex({ x, y }) * this.bitPP;
        const RGB = this._colors.slice(index, index + this.bitPP);

        return translateRGB(RGB);
    }

    private setColor({ x, y }: Point, color: string) {
        const startIndex = this.startIndex({ x, y }) * this.bitPP;
        const [R, G, B] = translateHex(color);

        this._colors[startIndex] = R;
        this._colors[startIndex + 1] = G;
        this._colors[startIndex + 2] = B;
    }

    private startIndex({ x, y }: Point) {
        return x + y * this.width;
    }
}
