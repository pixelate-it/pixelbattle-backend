const cache = new Map();

class LoggingHelper {
    static sendPixelPlaced({ userID, color, x, y, tag }) {
        if(cache.has(`${userID}-${x}-${y}-${color}`)) return;
        cache.set(`${userID}-${x}-${y}-${color}`);

        console.log(
            `* [PIXEL] ${userID} - ` +
            `Cordinates: X${x} Y${y}; ` +
            `Color: ${color}; ` +
            `Tag: ${tag};`
        );
        
        setTimeout(() => cache.delete(`${userID}-${x}-${y}-${color}`), 750); // CORS spam fix 
    }
}

module.exports = LoggingHelper;