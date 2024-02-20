export interface Pixel {
    x: number;
    y: number;
    author: string | null;
    tag: string | null;
}

export interface MongoPixel extends Pixel {
    color: string;
}