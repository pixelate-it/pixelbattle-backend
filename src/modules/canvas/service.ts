import type { PixelUpdate, Point } from "./types";
import type { CanvasRepository } from "./repository";
import type { MongoPixel } from "@models";
import { translate } from "@utils";

export class CanvasService {
    private changes: Point[] = [];
    public pixels: Omit<MongoPixel, "color">[];
    public colors: Uint8ClampedArray;

    constructor(
        private repository: CanvasRepository,
        public readonly width: number,
        public readonly height: number,
        public readonly bitPP = 3
    ) {
        this.colors = new Uint8ClampedArray(width * height * bitPP);
        this.pixels = [];
    }

    public async init() {
        const pixels = await this.repository.fetch();

        if (pixels.length !== this.width * this.height) {
            throw new Error(
                `Canvas size mismatch. Expected ${this.width * this.height} pixels, got ${this.pixels.length}`
            );
        }

        pixels.forEach(({ color, ...pixel }, index) => {
            const [R, G, B] = translate.hexadecimal(color);
            const from = index * this.bitPP;

            this.colors[from] = R;
            this.colors[from + 1] = G;
            this.colors[from + 2] = B;
            this.pixels[index] = pixel;
        });

        return this.pixels;
    }

    public async sync() {
        const updates = this.changes.map((point) => ({
            ...point,
            ...this.getPixelUpdate(point)
        }));

        await this.repository.bulkUpdate(updates);
        this.changes = [];
    }

    private getPixelUpdate({ x, y }: Point): PixelUpdate {
        const pixel = this.pixels.find(
            (pixel) => pixel.x === x && pixel.y === y
        )!;

        return {
            author: pixel.author,
            tag: pixel.tag,
            color: this.getColor({ x, y })
        };
    }

    public setPixel(pixel: MongoPixel) {
        const point: Point = { x: pixel.x, y: pixel.y };
        const data = this.getPixel(point);

        if (!data) return;

        this.setColor(point, pixel.color);
        data.author = pixel.author;
        data.tag = pixel.tag;

        this.changes.push(point);

        return pixel;
    }

    public getPixel({ x, y }: Point) {
        return this.pixels.find((pixel) => pixel.x === x && pixel.y === y);
    }

    public setColor(point: Point, color: string) {
        const index = this.startIndex(point);
        const [R, G, B] = translate.hexadecimal(color);

        this.colors[index] = R;
        this.colors[index + 1] = G;
        this.colors[index + 2] = B;
    }

    public getColor({ x, y }: Point) {
        const index = this.startIndex({ x, y });
        return translate.RGB(this.colors.slice(index, index + this.bitPP));
    }

    private startIndex({ x, y }: Point) {
        return (x + y * this.width) * this.bitPP;
    }
}
