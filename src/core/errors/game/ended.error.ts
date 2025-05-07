import { ApiError } from "../base.error";

export class EndedError extends ApiError {
    public statusCode = 400;
    public message = "Please wait for a new game";
}
