import IPoint from "types/IPoint"

//клон из application/canvas/commons/helpers/MathUtils, но без зависимости от PIXI.Point
function lerpNumber(begin:number, end:number, t:number):number {
    return (begin + (end - begin) * t)
}

export const lerp = (begin:IPoint, end:IPoint, t = 0.5):IPoint => ({
    x: lerpNumber(begin.x, end.x, t),
    y: lerpNumber(begin.y, end.y, t)
})

export const add = (p1:IPoint, p2:IPoint):IPoint => ({
    x: p1.x + p2.x,
    y: p1.y + p2.y
})

export const subtract = (p1:IPoint, p2:IPoint):IPoint => ({
    x: p1.x - p2.x,
    y: p1.y - p2.y
})

// distance between two points
export const distanceSqr = (p1:IPoint, p2:IPoint):number => {
    let dx = p2.x - p1.x
    let dy = p2.y - p1.y
    return dx * dx + dy * dy
}

export const length = (p:IPoint):number => Math.sqrt(p.x * p.x + p.y * p.y)

export const clone = (p:IPoint):IPoint => ({x: p.x, y: p.y})

