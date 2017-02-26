import WidgetsController from "./WidgetsController"
import * as mover from "./mover/mover"
import WidgetTypes from "./widgets/WidgetTypes"
import * as gestures from "./gestures"
import {discreteRound} from "./mover/utils"

const simplify = require('simplify-js')

const coefficients = {
    [WidgetTypes.DEBUG]: 1, // fake
    [WidgetTypes.TEXTLINE]: 0.9,
    [WidgetTypes.PARAGRAPH]: 0.78,
    [WidgetTypes.HEADLINE]: 0.83,
    [WidgetTypes.BUTTON]: 0.9,
    [WidgetTypes.COMBOBOX]: 0.8,
    [WidgetTypes.PICTURE]: 0.8,
    [WidgetTypes.RECTANGLE]: 0.85,
    [WidgetTypes.TEXTFIELD]: 0.8,
    [WidgetTypes.LINE]: 0.94,
    [WidgetTypes.VLINE]: 0.94,
    [WidgetTypes.CIRCLE]: 0.85,
    [WidgetTypes.ARROW]: 0.8,
    [WidgetTypes.ERASE]: 0.6
}

const finalizedGestures = [
    WidgetTypes.PARAGRAPH,
    WidgetTypes.COMBOBOX,
    WidgetTypes.PICTURE,
    WidgetTypes.RECTANGLE,
    WidgetTypes.CIRCLE,
    WidgetTypes.ARROW,
    WidgetTypes.ERASE,
    WidgetTypes.LINE,
    WidgetTypes.VLINE,
]

let widgetsController:WidgetsController
let isNewGesture = true
let _points, _strokes, _g, _rc

function Point(x, y) {
    this.X = x
    this.Y = y
    this.x = x
    this.y = y
}

export function initRecognizer(_widgetsController:WidgetsController) {
    gestures.init()
    widgetsController = _widgetsController

    _points = [] // point array for current stroke
    _strokes = [] // array of point arrays

    let canvas = <any>document.getElementById('strokeCanvas')
    _g = canvas.getContext('2d')
    _g.lineWidth = 1.5

    _rc = getCanvasRect(canvas)
    //todo переделать на события
    widgetsController.inputsHandler.setDrawCallbacks(onStart, onContinue, onStop)
}

function onStart(_x, _y) {
    log.log('drw', 'onStart')
    let {x, y} = getPosition(_x, _y)

    if (isNewGesture) {
        _points.length = 0
        _strokes.length = 0

    }
    const clr = "#6699FF"
    _g.strokeStyle = clr
    _g.fillStyle = clr

    isNewGesture = false
    _points[0] = new Point(x, y)
    _g.fillRect(x - 1, y - 1, 2, 2)

    clearTimeout(timeoutId)
}

function onContinue(_x, _y) {
    log.log('drw', 'onContinue')
    let {x, y} = getPosition(_x, _y)
    _points[_points.length] = new Point(x, y) // append
    drawConnectedPoint(_points.length - 2, _points.length - 1)
}

let timeoutId

function onStop(cancel:boolean) {
    log.log('drw', 'onStop', cancel)
    //todo start simplify from here
    if (!cancel) {
        _strokes.push(_points.slice()) // add new copy to set
        drawSimplifiedStroke(_points.slice())

        let res = recognize()
        log.log('drw', 'res.Name', res.Name, res.Score)
        if(typeof res.Name !== 'string') {
            return
        }

        if (res.Name && res.Score > coefficients[res.Name] && finalizedGestures.includes(res.Name)) {
            tryCreateWidget(res)
            return
        }

        timeoutId = setTimeout(() => {
            let res = recognize()
            tryCreateWidget(res)
        }, 1000)
    } else {
        clearRect()
        clearPoints()
    }

    _points.length = 0
}

function drawSimplifiedStroke(_points) {
    log.log('drw', '_points.length', _points.length)
    if (_points.length >= 2) {
        let simplPoints = simplify(_points, 10)
        log.log('drw', 'simplPoints.length', simplPoints.length)

        let clr = "#990000"
        _g.beginPath();
        _g.strokeStyle = clr
        _g.fillStyle = clr
        _g.moveTo(simplPoints[0].x, simplPoints[0].y)
        for (let i = 1; i < simplPoints.length; i++) {
            _g.lineTo(simplPoints[i].x, simplPoints[i].y)
        }
        _g.stroke()
    }
}

let prevBounds

function tryCreateWidget(res) {
    log.log('drw', 'tryCreateWidget')
    console.info(res)
    let bounds = getBounds()
    if ((bounds.width >= 50 || bounds.height >= 50)
        && res.Score > coefficients[res.Name]) {
        if (res.Name === WidgetTypes.ERASE) {
            let x = bounds.x + bounds.width / 2
            let y = bounds.y + bounds.height / 2
            let widget = widgetsController.getWidgetUnderPoint(mover.getCanvasToScreenX(x), mover.getCanvasToScreenY(y))
            if (widget) {
                widgetsController.removeWidget(widget)
            }
        } else {
            //let correctedBounds = correctBounds(prevBounds, bounds)
            widgetsController.createWidget(res.Name, bounds, {name: `${res.Name} (${round(res.Score, 2)})`})
            prevBounds = bounds
        }
    }
    clearRect()
    clearPoints()
}

////////////////////////////////////////////////////////////
// recognition
////////////////////////////////////////////////////////////

function recognize():{ Score:number; Name:string | null } {
    if (_strokes.length > 1 || (_strokes.length == 1 && _strokes[0].length >= 10)) {
        return gestures.recognize(_strokes)
    } else {
        return {Score: 0, Name: null}
    }
}

function clearPoints() {
    isNewGesture = true
}

function getBounds() {
    let leftX = Number.MAX_VALUE
    let rightX = Number.MIN_VALUE
    let topY = Number.MAX_VALUE
    let bottomY = Number.MIN_VALUE

    for (let i = 0; i < _strokes.length; i++) {
        let stroke = _strokes[i]
        for (let j = 0; j < stroke.length; j++) {
            let point = stroke[j]

            if (point.X < leftX) {
                leftX = point.X
            }

            if (point.X > rightX) {
                rightX = point.X
            }

            if (point.Y < topY) {
                topY = point.Y
            }

            if (point.Y > bottomY) {
                bottomY = point.Y
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

const STEP = 20

function correctBounds(prevBounds, newBounds) {
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

////////////////////////////////////////////////////////////
// utils
////////////////////////////////////////////////////////////

function getPosition(clientX, clientY) {
    return {
        x: mover.getScreenToCanvasX(clientX),
        y: mover.getScreenToCanvasY(clientY)
    }
}

function drawConnectedPoint(from, to) {
    _g.beginPath()
    _g.moveTo(_points[from].X, _points[from].Y)
    _g.lineTo(_points[to].X, _points[to].Y)
    _g.closePath()
    _g.stroke()
}

function clearRect() {
    _g.clearRect(0, 0, _rc.width, _rc.height)
}

function getCanvasRect(canvas) {
    let w = canvas.width
    let h = canvas.height

    let cx = canvas.offsetLeft
    let cy = canvas.offsetTop
    while (canvas.offsetParent != null) {
        canvas = canvas.offsetParent
        cx += canvas.offsetLeft
        cy += canvas.offsetTop
    }
    return {x: cx, y: cy, width: w, height: h}
}

// round 'n' to 'd' decimals
function round(n, d) {
    d = Math.pow(10, d)
    return Math.round(n * d) / d
}