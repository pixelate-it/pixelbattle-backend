import { ApiError } from "../base.error";

export class UserCooldownError extends ApiError {
    public statusCode = 400;
    public message = "Wait a few seconds";

    constructor(time: number) {
        super();
        this.data = { time };
    }
}
