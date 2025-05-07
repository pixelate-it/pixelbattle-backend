import { ApiError } from "../base.error";

export class TokenBannedError extends ApiError {
    public statusCode = 400;
    public message = "You are banned from PixelBattle";
}
