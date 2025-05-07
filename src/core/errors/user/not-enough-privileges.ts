import { ApiError } from "../base.error";

export class NotEnoughPrivilegesError extends ApiError {
    public statusCode = 400;
    public message = "Not enough privileges";

    constructor(role: number) {
        super();
        this.data = { requiredRole: role };
    }
}
