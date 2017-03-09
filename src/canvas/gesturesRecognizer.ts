import IPoint from './mover/types/IPoint'
import Gestures from './Gestures'

let recognizer

function Point(x, y) {
    this.X = x
    this.Y = y
}

export function init() {
    recognizer = new NDollarRecognizer(false)

    let useBoundedRotationInvariance = false

    ////////////////////////////////////////////////
    // Unistroke

    recognizer.AddGesture(Gestures.INPUT, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(0, 40), new Point(100, 40)]
    ])

    recognizer.AddGesture(Gestures.RECTANGLE, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0), new Point(100, 70), new Point(0, 70), new Point(0, 0)]
    ])

    //todo strange
    recognizer.AddGesture(Gestures.CIRCLE, useBoundedRotationInvariance, [
        [new Point(351, 8), new Point(386, 14), new Point(400, 50), new Point(386, 78), new Point(355, 88)]
    ])

    recognizer.AddGesture(Gestures.LINE, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0)]
    ])

    recognizer.AddGesture(Gestures.DOUBLE_LINE, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0), new Point(15, 7)]
    ])

    recognizer.AddGesture(Gestures.DOUBLE_LINE_V, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(0, 100), new Point(7, 15)]
    ])

    recognizer.AddGesture(Gestures.ERASE, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0), new Point(15, 7), new Point(100, 7), new Point(100, 14)]
    ])

    ////////////////////////////////////////////////
    // Multistrokes

    recognizer.AddGesture(Gestures.INPUT, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(0, 40)],
        [new Point(0, 40), new Point(100, 40)]
    ])

    recognizer.AddGesture(Gestures.RECTANGLE, useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0)],
        [new Point(100, 0), new Point(100, 70)],
        [new Point(100, 70), new Point(0, 70)],
        [new Point(0, 70), new Point(0, 0)]
    ])

    recognizer.AddGesture(Gestures.PICTURE, useBoundedRotationInvariance, [
        [new Point(30, 146), new Point(106, 222)],
        [new Point(30, 225), new Point(106, 146)]
    ])
}

export function recognize(strokes:IPoint[][]):IRecognizeResult {
    let $strokes = strokes.map(stroke => stroke.map(point => ({
        X: point.x, Y: point.y
    })))
    let res = recognizer.Recognize($strokes,
        false, //useBoundedRotationInvariance
        true, //requireSameNoOfStrokes
        false) //useProtractor

    return {
        score: res.Score,
        name: res.Name
    }
}

export interface IRecognizeResult {
    score:number
    name:Gestures | null
}
