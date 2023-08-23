export function jsonParser<T = unknown>(inputString?: string, fallback: unknown = []): T {
    if (inputString) {
        try {
            return JSON.parse(inputString);
        } catch (e) {
            return fallback as T;
        }
    } else {
        return fallback as T;
    }
}
