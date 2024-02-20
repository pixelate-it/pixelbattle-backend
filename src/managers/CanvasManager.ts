import { Collection } from "mongodb";
import { MongoPixel, Pixel } from "../models/MongoPixel";
import { BaseManager } from "./BaseManager";
import { utils } from "../extra/Utils";

interface Point {
    x: number;
    y: number;
}


export class CanvasManager extends BaseManager<MongoPixel> {
    private readonly bitPP = 3;
    private _colors: Uint8Array;
    private _pixels: Pixel[];
    private changes: Point[];

    constructor(collection: Collection<MongoPixel>, readonly width: number, readonly height: number) {
        super(collection);

        this._colors = new Uint8Array(width * height * this.bitPP);
        this._pixels = [];
        this.changes = [];
    }
    public get pixels() {
        return this._pixels;
    }

    public get colors() {
        return this._colors;
    }

    private startIndex({ x, y }: Point) {
        return x + y * this.width;
    }

    public async init() {
        const colors: number[][] = [];

        this._pixels = await this.collection
            .find({}, { projection: { _id: 0 } })
            .toArray()
            .then(pixels =>  pixels.map((pixel) => {
                const { color, ...pix } = pixel;
                colors.push(utils.translateHex(color));

                return pix;
            }));
        this._colors.set(colors.flat());

        return this._pixels;
    }

    public async sendPixels() {
        const bulk = this.changes.map((pixel) => {
            const data = this.select({ x: pixel.x, y: pixel.y })!;
            return {
                updateOne: {
                    filter: { x: pixel.x, y: pixel.y },
                    update: { $set: { ...data, color: this.getColor({ x: pixel.x, y: pixel.y }) } },
                    hint: { x: 1, y: 1 }
                }
            }
        });

        if(bulk.length) await this.collection.bulkWrite(bulk);

        this.changes = [];
        return this._pixels;
    }

    public select({ x, y }: Point): Pixel | any {
        this._pixels.find(pixel => ((pixel.x === x) && (pixel.y === y)))
    }

    public async clear(color: string) {
        this.changes = [];

        const pixels = new Array(this.width * this.height)
            .map((_, i) => ({
                x: i % this.width,
                y: Math.floor(i / this.width),
                author: null,
                tag: null
            }));

        await this.collection.drop();
        await this.collection.insertMany(pixels.map(pixel => ({ ...pixel, color })), { ordered: true });

        this._pixels = pixels;

        this._colors = new Uint8Array();
        const RGB = utils.translateHex(color);
        pixels.forEach((_, index) => this._colors.set(RGB, index * 3))

        return pixels;
    }

    public paint(pixel: MongoPixel) {
        const canvasPixel = this.select({ x: pixel.x, y: pixel.y });

        if(!canvasPixel) return;

        this.setColor({ x: pixel.x, y: pixel.y }, pixel.color);
        canvasPixel.author = pixel.author;
        canvasPixel.tag = pixel.tag;

        this.changes.push({ x: pixel.x, y: pixel.y })

        return pixel;
    }

    public getColor({ x, y }: Point) {
        const index = this.startIndex({ x, y });
        const RGB = this._colors.slice(index * this.bitPP, index * this.bitPP + this.bitPP);

        return utils.translateRGB(Array.from(RGB));
    }

    private setColor({ x, y }: Point, color: string) {
        const startIndex = this.startIndex({ x, y }) * this.bitPP;
        const [R, G, B] = utils.translateHex(color);

        this._colors[startIndex] = R;
        this._colors[startIndex + 1] = G;
        this._colors[startIndex + 2] = B;
    }
}