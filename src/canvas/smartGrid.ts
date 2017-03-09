import IRect from './mover/types/IRect'
import IPoint from './mover/types/IPoint'
import {discreteRound} from './mover/utils'

const STEP = 10
let prevBounds:IRect | null

export function getBounds(strokes:IPoint[][]):IRect {
    let leftX = Number.MAX_VALUE
    let rightX = Number.MIN_VALUE
    let topY = Number.MAX_VALUE
    let bottomY = Number.MIN_VALUE

    for (let i = 0; i < strokes.length; i++) {
        let stroke = strokes[i]
        for (let j = 0; j < stroke.length; j++) {
            let point = stroke[j]

            if (point.x < leftX) {
                leftX = point.x
            }

            if (point.x > rightX) {
                rightX = point.x
            }

            if (point.y < topY) {
                topY = point.y
            }

            if (point.y > bottomY) {
                bottomY = point.y
            }
        }
    }
    return {
        x: discreteRound(leftX, STEP),
        y: discreteRound(topY, STEP),
        width: discreteRound(rightX - leftX, STEP),
        height: discreteRound(bottomY - topY, STEP)
    }
}


export function correctBounds(newBounds) {
    if (!prevBounds) {
        return newBounds
    }

    if (Math.abs(prevBounds.x - newBounds.x) < STEP + 1) {
        newBounds.x = prevBounds.x
        if (Math.abs(prevBounds.width - newBounds.width) < STEP + 1) {
            newBounds.width = prevBounds.width
        }
    }

    if (Math.abs(prevBounds.y - newBounds.y) < STEP + 1) {
        newBounds.y = prevBounds.y
        if (Math.abs(prevBounds.height - newBounds.height) < STEP + 1) {
            newBounds.height = prevBounds.height
        }
    }

    return newBounds
}

export function savePrevBounds(value:IRect) {
    prevBounds = value
}

export function clearPrevBounds() {
    prevBounds = null
}