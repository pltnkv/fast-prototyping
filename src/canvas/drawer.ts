import WidgetsController from './WidgetsController'
import * as mover from './mover/mover'
import WidgetType from './widgets/WidgetType'
import * as gestures from './gesturesRecognizer'
import IRect from './mover/types/IRect'
import {correctBounds, getBounds, savePrevBounds} from './smartGrid'
import IPoint from './mover/types/IPoint'
import {distanceSqr} from './mover/PointUtils'
import GesturesDrawer from './GesturesDrawer'
import GestureRecognizer from './GestureRecognizer'

let widgetsController:WidgetsController
let currentGesture = new GestureRecognizer()
let drawer = new GesturesDrawer()
let isNewGesture = true
let timeoutId:number

export function initRecognizer(_widgetsController:WidgetsController) {
    gestures.init()
    widgetsController = _widgetsController

    //todo переделать на события
    widgetsController.inputsHandler.setDrawCallbacks(onStart, onContinue, onStop)
}

export function getStrokesCount():number {
    return currentGesture.strokes.length
}

function onStart(_x, _y) {
    log.log('drw', 'onStart')
    if (isNewGesture) {
        currentGesture.clear()
    }
    isNewGesture = false

    let pos = getPosition(_x, _y)
    currentGesture.addPoint(pos)
    drawer.startNewStroke(pos)

    clearTimeout(timeoutId)
}

function onContinue(_x, _y) {
    log.log('drw', 'onContinue')
    currentGesture.addPoint(getPosition(_x, _y))
    drawer.drawConnectedPoint(currentGesture, currentGesture.points.length - 2, currentGesture.points.length - 1)
}

// start simplify from here
function onStop(reason:'normal' | 'cancel' | 'point') {
    log.log('drw', 'onStop, reason=', reason)

    if (reason === 'normal') {
        currentGesture.completeStroke()
        drawer.drawSimplifiedStroke(currentGesture.points.slice())

        let bounds = getBounds(currentGesture.strokes)
        let widgetType = currentGesture.recognize(bounds)
        if (widgetType) {
            createWidget(widgetType, bounds)
            markNewGesture()
        } else {
            timeoutId = setTimeout(() => {
                markNewGesture()
            }, 1000)
        }
    } else if (reason === 'point') {
        currentGesture.completeWithPoint()

        let bounds = getBounds(currentGesture.strokes)
        let widgetType = currentGesture.recognize(bounds)
        if (widgetType) {
            createWidget(widgetType, bounds)
        }

        markNewGesture()
    } else {
        markNewGesture()
    }
    currentGesture.clearPoints()
}

function createWidget(widgetType:WidgetType, bounds:IRect) {
    log.log('drw', 'tryCreateWidget')
    if (widgetType === WidgetType.ERASE) {
        let x = bounds.x + bounds.width / 2
        let y = bounds.y + bounds.height / 2
        let widget = widgetsController.getWidgetUnderPoint(mover.getCanvasToScreenX(x), mover.getCanvasToScreenY(y))
        if (widget) {
            widgetsController.removeWidget(widget)
        }
    } else {
        let correctedBounds = correctBounds(bounds)
        widgetsController.createWidget(widgetType, correctedBounds, {name: `---`})
        savePrevBounds(correctedBounds)
    }
}

function markNewGesture() {
    drawer.clear()
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