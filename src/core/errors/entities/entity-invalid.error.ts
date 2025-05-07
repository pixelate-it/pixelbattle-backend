import { ApiError } from "@core/errors/base.error";

export class EntityInvalidError extends ApiError {
    public statusCode = 400;
    public message = "Entity is invalid";

    constructor(entity: string) {
        super();
        this.data = { entity };
    }
}
