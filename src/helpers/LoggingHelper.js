class LoggingHelper {
    static sendPixelPlaced({ userID, color, x, y, tag }) {
        return console.log([
            `* [PIXEL] ${userID} -`,
            `Coordinates: X${x} Y${y};`,
            `Color: ${color};`,
            `Tag: ${tag};`,
        ].join(' '));
    }
}

module.exports = LoggingHelper;