import WidgetsController from "./WidgetsController"
import * as mover from "./mover/mover"
import WidgetTypes from "./widgets/WidgetTypes"
import * as gestures from "./gestures"
import IRect from "./mover/types/IRect";
import {correctBounds, getBounds, savePrevBounds} from "./smartGrid";
import IPoint from "./mover/types/IPoint";
import {distanceSqr} from "./mover/PointUtils";

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
let _points:IPoint[]
let _strokes:IPoint[][]
let _g:CanvasRenderingContext2D
let _rc:IRect

let timeoutId:number

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
    _points[0] = {x, y}
    _g.fillRect(x - 1, y - 1, 2, 2)

    clearTimeout(timeoutId)
}

function onContinue(_x, _y) {
    log.log('drw', 'onContinue')
    _points[_points.length] = getPosition(_x, _y) // append
    drawConnectedPoint(_points.length - 2, _points.length - 1)
}


function onStop(cancel:boolean) {
    console.log('onStop', cancel)
    log.log('drw', 'onStop', cancel)
    // todo start simplify from here
    // todo распознавать точку как отдельный элемент ввода
    if (!cancel) {
        console.log('isPoint', isPoint(_points))
        log.log('t', 'isPoint', isPoint(_points))
        _strokes.push(_points.slice()) // add new copy to set
        drawSimplifiedStroke(_points.slice())

        let res = recognize()
        log.log('drw', 'res.Name', res.Name, res.Score)

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

function tryCreateWidget(res) {
    log.log('drw', 'tryCreateWidget')
    console.info(res)
    let bounds = getBounds(_strokes)
    //drawBoundingBox(bounds)
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
            let correctedBounds = correctBounds(bounds)
            widgetsController.createWidget(res.Name, correctedBounds, {name: `${res.Name} (${round(res.Score, 2)})`})
            savePrevBounds(correctedBounds)
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


////////////////////////////////////////////////////////////
// utils
////////////////////////////////////////////////////////////

function getPosition(clientX, clientY):IPoint {
    return {
        x: mover.getScreenToCanvasX(clientX),
        y: mover.getScreenToCanvasY(clientY)
    }
}

function drawConnectedPoint(from, to) {
    _g.beginPath()
    _g.moveTo(_points[from].x, _points[from].y)
    _g.lineTo(_points[to].x, _points[to].y)
    _g.closePath()
    _g.stroke()
}

function clearRect() {
    // _g.clearRect(0, 0, _rc.width, _rc.height)
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


const POINT_DISTANCE_THRESHOLD = Math.sqrt(2)

function isPoint(stroke:IPoint[]):boolean {
    return stroke.length === 1
        || stroke.length <= 4 && distanceSqr(stroke[0], stroke[stroke.length-1]) < POINT_DISTANCE_THRESHOLD
}

////////////////////////////////////////////////////////////
// DEBUG
////////////////////////////////////////////////////////////


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


function drawBoundingBox(rect:IRect) {
    let clr = "#0a9900"
    _g.beginPath();
    _g.rect(rect.x, rect.y, rect.width, rect.height)
    _g.strokeStyle = clr
    _g.stroke()
}