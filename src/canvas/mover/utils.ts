export function distance(x1:number, y1:number, x2:number, y2:number) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

export function discreteRound(val, step) {
    let module = val % step
    let int = val - module
    return Math.round(module / step) === 0 ? int : int + step
}