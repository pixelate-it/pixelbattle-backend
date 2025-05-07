import type { SchemaErrorFormatter } from "fastify/types/schema";
import { ApiError } from "../base.error";

export class ValidationError extends ApiError {
    public statusCode = 400;
    public message = "Validation error";

    constructor(schema: Parameters<SchemaErrorFormatter>) {
        super();

        this.data = {
            errors: schema[0],
            dataVar: schema[1]
        };
    }
}
