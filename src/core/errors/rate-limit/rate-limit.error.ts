import { ApiError } from "../base.error";

export class RateLimitError extends ApiError {
    public statusCode = 429;
    public message = "Rate limit";

    constructor(after: string) {
        super();

        this.data = { after };
    }
}
