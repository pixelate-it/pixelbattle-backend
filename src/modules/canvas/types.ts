import type { MongoPixel } from "@models";

export interface Point {
    x: number;
    y: number;
}

export type PixelUpdate = Omit<MongoPixel, "x" | "y">;
