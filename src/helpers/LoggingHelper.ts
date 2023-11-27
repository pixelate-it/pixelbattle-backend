const cache = new Map();

interface PixelInfo {
    userID: string;
    x: number;
    y: number;
    tag: string | null;
    color: string;
}

export class LoggingHelper {
    static sendPixelPlaced({ userID, color, x, y, tag }: PixelInfo) {
        if(cache.has(`${userID}-${x}-${y}-${color}`)) return;
        cache.set(`${userID}-${x}-${y}-${color}`, 1);

        console.log(
            `* [PIXEL] ${userID} - ` +
            `Cordinates: X${x} Y${y}; ` +
            `Color: ${color}; ` +
            `Tag: ${tag};`
        );
        
        setTimeout(() => cache.delete(`${userID}-${x}-${y}-${color}`), 750); // CORS spam fix 
    }
}
