import { ObjectId, Document } from "mongodb";

export interface MongoPixel extends Document {
    _id: ObjectId;
    x: number;
    y: number;
    author: string | null;
    tag: string | null;
    color: string;
}