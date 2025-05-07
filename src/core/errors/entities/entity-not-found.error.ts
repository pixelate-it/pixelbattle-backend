import { ApiError } from "@core/errors/base.error";

export class EntityNotFoundError extends ApiError {
    public statusCode = 404;
    public message = "Entity is not found";

    constructor(entity: string) {
        super();
        this.data = { entity };
    }
}
