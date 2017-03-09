import WidgetsController from './WidgetsController'
import * as mover from './mover/mover'
import WidgetType from './widgets/WidgetType'
import * as gestures from './gesturesRecognizer'
import IRect from './mover/types/IRect'
import {correctBounds, getBounds, savePrevBounds} from './smartGrid'
import IPoint from './mover/types/IPoint'
import {distanceSqr} from './mover/PointUtils'
import Gestures from './Gestures'

const simplify = require('simplify-js')

// ниже 0.7 может выдать полную хрень
const coefficients = {
    [WidgetType.DEBUG]: 1, // fake
    [WidgetType.TEXTLINE]: 0.9,
    [WidgetType.PARAGRAPH]: 0.78,
    [WidgetType.HEADLINE]: 0.83,
    [WidgetType.BUTTON]: 0.9,
    [WidgetType.COMBOBOX]: 0.8,
    [WidgetType.PICTURE]: 0.8,
    [WidgetType.RECTANGLE]: 0.85,
    [WidgetType.TEXTFIELD]: 0.8,
    [WidgetType.LINE]: 0.94,
    [WidgetType.VLINE]: 0.94,
    [WidgetType.CIRCLE]: 0.85,
    [WidgetType.ARROW]: 0.8,
    [WidgetType.ERASE]: 0.6
}

const finalizedGestures = [
    WidgetType.PARAGRAPH,
    WidgetType.COMBOBOX,
    WidgetType.PICTURE,
    WidgetType.RECTANGLE,
    WidgetType.CIRCLE,
    WidgetType.ARROW,
    WidgetType.ERASE,
    WidgetType.LINE,
    WidgetType.VLINE
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

export function getStrokesCount():number {
    return _strokes.length
}

function onStart(_x, _y) {
    log.log('drw', 'onStart')
    let {x, y} = getPosition(_x, _y)

    if (isNewGesture) {
        _points.length = 0
        _strokes.length = 0
    }

    const clr = '#6699FF'
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


// start simplify from here
function onStop(reason:'normal' | 'cancel' | 'point') {
    log.log('drw', 'onStop, reason=', reason)

    if (reason === 'normal') {
        log.log('t', 'isPoint', isPoint(_points))
        _strokes.push(_points.slice()) // add new copy to set
        drawSimplifiedStroke(_points.slice())

        let res = recognize()
        log.log('drw', 'res=', res)

        // todo на основе жестов создавать виджеты
        /*let bounds = getBounds(_strokes)
        if (canCreateWidget(res, bounds) && finalizedGestures.includes(res.name!)) {
            tryCreateWidget(res, bounds)
            return
        }

        timeoutId = setTimeout(() => {
            res = recognize()
            bounds = getBounds(_strokes)
            tryCreateWidget(res, bounds)
        }, 1000)*/
    } else if (reason === 'point') {
        // точка - это конечное событие после него обнуляются strokes и пытается создаться фигура
        console.log('point')

        let res = recognize()
        // попробовать создать енум из строк в тс, возможно нужно использовать types
        // if (res.name === WidgetType.L) {
        //     let bounds = getBounds(_strokes)
        //     tryCreateWidget(res, bounds)
        // }
        // if (res.Name && res.Score > coefficients[res.Name] && finalizedGestures.includes(res.Name)) {
        //     tryCreateWidget(res)
        //     return
        // }

        clearRect()
        clearPoints()
    } else {
        clearRect()
        clearPoints()
    }

    _points.length = 0
}

function tryCreateWidget(res, bounds:IRect) {
    log.log('drw', 'tryCreateWidget')
    //drawBoundingBox(bounds)
    console.log('tryCreateWidget')
    if (canCreateWidget(res, bounds)) {
        if (res.Name === WidgetType.ERASE) {
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

function canCreateWidget(res, bounds:IRect):boolean {
    return (bounds.width >= 50 || bounds.height >= 50) && res.Score > coefficients[res.Name]
}

////////////////////////////////////////////////////////////
// recognition
////////////////////////////////////////////////////////////

function recognize():gestures.IRecognizeResult {
    let res
    if (_strokes.length > 1 || (_strokes.length == 1 && _strokes[0].length >= 10)) {
        res = gestures.recognize(_strokes)
    } else {
        res = {score: 0, name: null}
    }
    console.log('recognize', Gestures[res.name], res.score)
    return res
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
        || stroke.length <= 4 && distanceSqr(stroke[0], stroke[stroke.length - 1]) < POINT_DISTANCE_THRESHOLD
}

////////////////////////////////////////////////////////////
// DEBUG
////////////////////////////////////////////////////////////


function drawSimplifiedStroke(_points) {
    log.log('drw', '_points.length', _points.length)
    if (_points.length >= 2) {
        let simplPoints = simplify(_points, 10)
        log.log('drw', 'simplPoints.length', simplPoints.length)

        let clr = '#990000'
        _g.beginPath()
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
    let clr = '#0a9900'
    _g.beginPath()
    _g.rect(rect.x, rect.y, rect.width, rect.height)
    _g.strokeStyle = clr
    _g.stroke()
}