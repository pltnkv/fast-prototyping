import * as utils from "./utils"

const WHEEL_EVENT_NAME = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel'
const DEFAULT_SCALE = 0.4
const DEFAULT_MAX_SCALE = 4
const START_ZOOMING_THRESHOLD = 50

const limits = {
    minScale: DEFAULT_SCALE,
    maxScale: DEFAULT_MAX_SCALE
}

let currentX = 0
let currentY = 0
let currentScale = 1

let stage

let touchMode = false
let inEventProcessing = false
let startedZooming = false
let inMultiToucheMode = false
let initTouchesDistance:number
let initScale:number
let prevMultiTouchCenterX:number
let prevMultiTouchCenterY:number
let startDrawCallback
let continueDrawCallback
let stopDrawCallback
let selectCallback
let unselectCallback
let isClickBySelectedWidgetCallback
let moveWidgetCallback
let saveOffsetForMovedWidget
let startEditMode

/**
 * Подписываемся на мышиные и тач-события для перемещения доски
 */
export function init(_stage) {
    stage = _stage
    let offsetX
    let offsetY

    let stageContainer = stage.parentElement
    stageContainer.addEventListener('mousedown', onMouseDown)
    stageContainer.addEventListener('touchstart', onTouchStart)
    stageContainer.addEventListener(WHEEL_EVENT_NAME, onMouseWheel)

    updateViewport()

    function moveStage(x, y) {
        currentX = x
        currentY = y
    }

    function updateViewport() {
        stage.style.transform = `translateX(${currentX}px) translateY(${currentY}px) scale(${currentScale})`
        requestAnimationFrame(updateViewport)
    }

    ///////////////////////////////////////////
    // Обработка мышинных событий
    ///////////////////////////////////////////

    function onMouseDown(e) {
        if (!inEventProcessing) {
            if (e.ctrlKey) {
                startDrawCallback(e.clientX, e.clientY)
            } else {
                inEventProcessing = true
                touchMode = false
                offsetX = e.clientX - currentX
                offsetY = e.clientY - currentY
            }
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }
        //e.preventDefault()
    }

    function onMouseUp(e) {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        if (!touchMode) {
            inEventProcessing = false
            if (e.ctrlKey) {
                stopDrawCallback()
            }
            if (e.shiftKey) {
                selectCallback(e.clientX, e.clientY)
            }
        }
    }

    function onMouseMove(e) {
        if (e.ctrlKey) {
            continueDrawCallback(e.clientX, e.clientY)
        } else {
            moveStage(e.clientX - offsetX, e.clientY - offsetY)
        }
    }

    function onMouseWheel(e) {
        changeScale(getNewScaleAfterWheel(e), e.clientX, e.clientY)
        e.preventDefault()
    }

    function getNewScaleAfterWheel(e:any) {
        let deltaZoom:number = e.wheelDelta ? e.wheelDelta : (e.deltaY ? -e.deltaY * 20 : -e.deltaX * 20);
        return getNewScale(deltaZoom)
    }

    ///////////////////////////////////////////
    // Обработка тач-событий
    ///////////////////////////////////////////

    let touchStartX
    let touchStartY
    let needToSelect = false
    let moveWidgetMode = false
    let editMode = false
    let prevTouchTime = Date.now()
    let DOUBLE_TOUCH_TIME = 350

    function onTouchStart(e) {
        editMode = false
        if (!inEventProcessing && !inMultiToucheMode) {
            inEventProcessing = true
            touchMode = true

            let touch = e.touches[0]
            touchStartX = touch.clientX
            touchStartY = touch.clientY

            let selectedWidget = isClickBySelectedWidgetCallback(touchStartX, touchStartY)
            if (selectedWidget) {
                let currentTouchTime = Date.now()
                if (currentTouchTime - prevTouchTime < DOUBLE_TOUCH_TIME && selectedWidget.isEditModeAvailable()) {
                    editMode = true
                    startEditMode(selectedWidget)
                } else {
                    moveWidgetMode = true
                    saveOffsetForMovedWidget(selectedWidget, touchStartX, touchStartY)
                }
            } else {
                needToSelect = true
                startDrawCallback(touchStartX, touchStartY)
            }

            document.addEventListener('touchmove', onTouchMove)
            document.addEventListener('touchend', onTouchEnd)
            document.addEventListener('touchstart', onSecondTouch)
        }
        prevTouchTime = Date.now()
        if (!editMode) {
            e.preventDefault()
        }
    }

    function onTouchMove(e) {
        if (!inMultiToucheMode) {
            let touch = e.touches[0]
            let clientX = touch.clientX
            let clientY = touch.clientY
            if (moveWidgetMode) {
                moveWidgetCallback(clientX, clientY)
            } else {
                continueDrawCallback(clientX, clientY)

                const THRESHOLD = 5
                if (needToSelect && (Math.abs(clientX - touchStartX) > THRESHOLD || Math.abs(clientY - touchStartY) > THRESHOLD)) {
                    unselectCallback() //учеть перемещение
                    needToSelect = false
                }
            }
        }
    }

    function onTouchEnd(e) {
        if (!inMultiToucheMode) {
            console.log('needToSelect', needToSelect)
            //todo cancel edit mode
            if (needToSelect) {
                selectCallback(touchStartX, touchStartY)
                stopDrawCallback(true)
            } else if (!moveWidgetMode && !editMode) {
                stopDrawCallback()
            }

            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
            document.removeEventListener('touchstart', onSecondTouch)
            if (touchMode) {
                inEventProcessing = false
            }
        }

        moveWidgetMode = false
        needToSelect = false
    }

    // multitouch

    function onSecondTouch(e) {
        let firstTouch = e.touches[0]
        let secondTouch = e.touches[1]
        if (secondTouch) {
            stopDrawCallback(true)
            inMultiToucheMode = true
            initTouchesDistance = utils.distance(
                firstTouch.clientX,
                firstTouch.clientY,
                secondTouch.clientX,
                secondTouch.clientY)
            initScale = currentScale
            prevMultiTouchCenterX = (firstTouch.clientX + secondTouch.clientX) * 0.5
            prevMultiTouchCenterY = (firstTouch.clientY + secondTouch.clientY) * 0.5

            startedZooming = false

            document.addEventListener('touchmove', onMultiTouchMove)
            document.addEventListener('touchend', onMultiTouchUp)
        }
    }

    function onMultiTouchMove(e):void {
        // Do not move if no second coords passed (second touch could be on opened comment, not on canvas).
        if (e.touches.length < 2) { //data.params.secondTouchX === undefined || data.params.secondTouchY === undefined
            return
        }

        needToSelect = false

        let firstTouch = e.touches[0]
        let secondTouch = e.touches[1]

        //зум начинается не сразу, а после преодоления порога
        let dist = utils.distance(firstTouch.clientX, firstTouch.clientY, secondTouch.clientX, secondTouch.clientY)
        if (!startedZooming && Math.abs(dist - initTouchesDistance) > START_ZOOMING_THRESHOLD) {
            startedZooming = true
            initTouchesDistance += (dist > initTouchesDistance)
                ? START_ZOOMING_THRESHOLD
                : -START_ZOOMING_THRESHOLD
        }

        let newCenterX:number = (firstTouch.clientX + secondTouch.clientX) * 0.5
        let newCenterY:number = (firstTouch.clientY + secondTouch.clientY) * 0.5
        let deltaX = newCenterX - prevMultiTouchCenterX
        let deltaY = newCenterY - prevMultiTouchCenterY

        if (startedZooming) {
            let newScale:number = initScale * dist / initTouchesDistance
            changeScale(
                newScale,
                newCenterX,
                newCenterY,
                deltaX,
                deltaY
            )
        }
        else {
            moveStage(currentX + deltaX, currentY + deltaY)
        }

        prevMultiTouchCenterX = newCenterX
        prevMultiTouchCenterY = newCenterY
    }

    function onMultiTouchUp():void {
        inMultiToucheMode = false
        document.removeEventListener('touchmove', onMultiTouchMove)
        document.removeEventListener('touchup', onMultiTouchUp)
    }
}
/**
 * Установка калбеков
 */

export function setDrawCallbacks(callback1, callback2, callback3) {
    startDrawCallback = callback1
    continueDrawCallback = callback2
    stopDrawCallback = callback3
}

export function setSelectWidgetCallback(callback) {
    selectCallback = callback
}

export function setUnselectWidgetCallback(callback) {
    unselectCallback = callback
}

export function setIsClickBySelectedWidgetCallback(callback) {
    isClickBySelectedWidgetCallback = callback
}

export function setMoveWidgetCallback(callback) {
    moveWidgetCallback = callback
}

export function setSaveOffsetForMovedWidget(callback) {
    saveOffsetForMovedWidget = callback
}

export function setStartEditModeCallback(callback) {
    startEditMode = callback
}

///////////////////////
///////////////////////
///////////////////////

function getNewScale(deltaZoom) {
    let zoom = 1 + Math.abs(deltaZoom) * 0.001
    if (deltaZoom < 0) {
        zoom = 1 / zoom
    }
    return currentScale * zoom
}

function changeScale(newScale:number, stageX:number, stageY:number, deltaX:number = 0, deltaY:number = 0):void {
    newScale = Math.min(newScale, limits.maxScale)
    newScale = Math.max(newScale, limits.minScale)
    let deltaScale = newScale / currentScale
    let dx = (stageX - currentX) * (deltaScale - 1)
    let dy = (stageY - currentY) * (deltaScale - 1)
    setPositionScale(currentX + deltaX - dx, currentY + deltaY - dy, newScale)
}

function setPositionScale(x:number, y:number, scale:number):void {
    currentScale = scale
    currentX = x
    currentY = y
}


// let debug = document.getElementById('debug')
//
// function log(text:string) {
// 	debug.innerHTML = text
// }

//utils

export function getCanvasToScreenX(x:number):number {
    return x * currentScale + currentX
}

export function getCanvasToScreenY(y:number):number {
    return y * currentScale + currentY
}

export function getScreenToCanvasX(x:number):number {
    return (x - currentX) / currentScale
}

export function getScreenToCanvasY(y:number):number {
    return (y - currentY) / currentScale
}
