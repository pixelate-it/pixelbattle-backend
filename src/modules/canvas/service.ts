import type { PixelUpdate, Point } from "./types";
import type { CanvasRepository } from "./repository";
import type { MongoPixel } from "@models";
import { translate } from "@utils";

export class CanvasService {
    private changes: Point[] = [];
    private pixels: MongoPixel[];
    private colors: Uint8ClampedArray;

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
        this.pixels = await this.repository.init();

        if (this.pixels.length !== this.width * this.height) {
            throw new Error(
                `Canvas size mismatch. Expected ${this.width * this.height} pixels, got ${this.pixels.length}`
            );
        }

        const buffer = this.pixels
            .map((pixels) => translate.hexadecimal(pixels.color))
            .flat();

        this.colors.set(buffer);
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
