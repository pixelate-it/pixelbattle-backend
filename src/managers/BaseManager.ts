import { BSON, Collection } from "mongodb";

export abstract class BaseManager<T extends BSON.Document> {
    constructor(protected collection: Collection<T>) {}
}