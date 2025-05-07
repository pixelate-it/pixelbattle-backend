import type { Collection, Document } from "mongodb";

export abstract class BaseRepository<T extends Document> {
    constructor(protected collection: Collection<T>) {}
}
