


const cache = new Map<string, boolean>();

interface PixelInfo {
    userID: string;
    x: number;
    y: number;
    tag: string | null;
    color: string;
}

export class LoggingHelper {
    static sendPixelPlaced({ userID, color, x, y, tag }: PixelInfo) {
        const hash = `${userID}-${x}-${y}-${color}`

        if (cache.has(hash))
            return;

        
        cache.set(hash, true);

        console.log(
            `* [PIXEL] ${userID} - ` +
            `Cordinates: X${x} Y${y}; ` +
            `Color: ${color}; ` +
            `Tag: ${tag};`
        );

        setTimeout(() => cache.delete(hash), 750); // CORS spam fix 
    }
}
