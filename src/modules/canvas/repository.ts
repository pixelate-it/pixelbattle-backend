import { BaseRepository } from "@core/database";
import type { MongoPixel } from "@models";

export class CanvasRepository extends BaseRepository<MongoPixel> {
    async init() {
        const indexes = await this.collection.indexes();

        if (!indexes.some((i) => i.key?.x === 1 && i.key?.y === 1)) {
            await this.collection.createIndex({ x: 1, y: 1 });
        }

        return this.collection
            .find({}, { projection: { _id: 0 } })
            .sort({ y: 1, x: 1 })
            .toArray();
    }

    async bulkUpdate(updates: MongoPixel[]) {
        if (!updates.length) return;

        await this.collection.bulkWrite(
            updates.map((update) => ({
                updateOne: {
                    filter: { x: update.x, y: update.y },
                    update: { $set: update }
                }
            })),
            { writeConcern: { w: "majority" } }
        );
    }

    async clear(width: number, height: number, color: string) {
        await this.collection.drop();
        await this.collection.createIndex({ x: 1, y: 1 });

        const pixels = Array.from({ length: width * height }, (_, i) => ({
            x: i % width,
            y: Math.floor(i / width),
            author: null,
            tag: null,
            color
        }));

        await this.collection.insertMany(pixels);
        return pixels;
    }
}
