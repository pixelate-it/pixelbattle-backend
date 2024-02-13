export function toJson<T>(value: T): { valueOf: () => string } & T {
    return {
        ...value,
        valueOf() {
            return JSON.stringify(value);
        },
    }
}