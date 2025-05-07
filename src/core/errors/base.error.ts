export class ApiError extends Error {
    public statusCode!: number;
    public message!: string;
    public data?: Record<string, unknown>;
}
