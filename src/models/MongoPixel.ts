export interface Pixel {
    x: number;
    y: number;
    author: string | null;
    tag: string | null;
    color: string | number[];
}

export interface MongoPixel extends Pixel {
    color: string;
}

export interface MongoPixelInternal extends Pixel {
    color: number[];
}