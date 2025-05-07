export function hexadecimal(hex: string): number[] {
    const R = parseInt(hex.slice(1, 3), 16);
    const G = parseInt(hex.slice(3, 5), 16);
    const B = parseInt(hex.slice(5, 7), 16);

    return [R, G, B];
}

export function RGB(rgb: Uint8ClampedArray | number[]): string {
    return (
        "#" +
        [...rgb]
            .map(
                (f) =>
                    (f < 16 ? "0" : "") +
                    Math.max(0, Math.min(f, 255)).toString(16)
            )
            .join("")
    );
}
