import * as mover from "./mover/mover"
import {initRecognizer} from "./recognizer"
import WidgetsController from "./widgets/WidgetsController"
import BaseWidget from "./widgets/BaseWidget"
import {discreteRound} from "./mover/utils"
import UIController from "./ui/UIController"

let stage = document.getElementById('baseContainer')
mover.init(stage)

let widgetsController = new WidgetsController()
widgetsController.setUIController(new UIController(widgetsController))

initRecognizer(widgetsController)


// selection and movement

mover.setSelectWidgetCallback((x, y) => {
    widgetsController.unselectSelectedWidget()
    let w = widgetsController.getWidgetUnderPoint(x, y)
    if (w) {
        widgetsController.selectWidget(w)
    }
})

mover.setUnselectWidgetCallback(() => {
    widgetsController.unselectSelectedWidget()
})

let lastSelectionIsButton

mover.setIsClickBySelectedWidgetCallback((x, y):BaseWidget => {
    let res = widgetsController.getWidgetOrButtonUnderPoint(x, y)
    let widget = res.widget
    lastSelectionIsButton = res.isButton

    if (!!widget && widget === widgetsController.getSelectedWidget()) {
        return widget
    } else {
        return null
    }
})

//moving and resizing
let savedOffsetX = 0
let savedOffsetY = 0
let savedWidth = 0
let savedHeight = 0

const MOVE_STEP = 10

mover.setSaveOffsetForMovedWidget((w:BaseWidget, x, y) => {
    let widgetPos = w.getPosition()
    if (lastSelectionIsButton) {//resizing
        let size = w.getSize()
        savedOffsetX = mover.getScreenToCanvasX(x)
        savedOffsetY = mover.getScreenToCanvasY(y)
        savedWidth = size.width
        savedHeight = size.height
    } else { //moving
        savedOffsetX = mover.getScreenToCanvasX(x) - widgetPos.x
        savedOffsetY = mover.getScreenToCanvasY(y) - widgetPos.y
    }
})

mover.setMoveWidgetCallback((x, y) => {
    let w = widgetsController.getSelectedWidget()
    if (lastSelectionIsButton) { //resizing
        let minSize = w.getMinSize()
        let newWidth = Math.max(minSize.width, savedWidth + mover.getScreenToCanvasX(x) - savedOffsetX, MOVE_STEP)
        let newHeight = Math.max(minSize.height, savedHeight + mover.getScreenToCanvasY(y) - savedOffsetY, MOVE_STEP)
        w.setSize(
            discreteRound(newWidth, MOVE_STEP),
            discreteRound(newHeight, MOVE_STEP)
        )
    } else { //moving
        let newX = mover.getScreenToCanvasX(x) - savedOffsetX
        let newY = mover.getScreenToCanvasY(y) - savedOffsetY
        w.setPosition(discreteRound(newX, MOVE_STEP), discreteRound(newY, MOVE_STEP))
    }
})

let legend = document.getElementById('legend')
let displayLegend = document.getElementById('displayLegend')
displayLegend.addEventListener('touchstart', (e) => {
    $(legend).fadeIn(200)
    e.stopPropagation()
}, true)

let hideLegend = $('.legend-overlay')[0]
hideLegend.addEventListener('touchstart', (e) => {
    $(legend).fadeOut(200)
    e.stopPropagation()
}, true)

// editMode

mover.setStartEditModeCallback((widget:BaseWidget) => {
    widget.setEditMode(true)
})