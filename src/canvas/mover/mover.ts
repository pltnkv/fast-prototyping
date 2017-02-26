import * as utils from "./utils"
import {IInputsHandler} from "./IInputsHandler";
import IInputsHandlerEvent from "./IInputsHandlerEvent";

const WHEEL_EVENT_NAME = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel'
const DEFAULT_SCALE = 0.4
const DEFAULT_MAX_SCALE = 4
const START_ZOOMING_THRESHOLD = 50

const limits = {
    minScale: DEFAULT_SCALE,
    maxScale: DEFAULT_MAX_SCALE
}

const MIDDLE_BUTTON_CODE = 1

let currentX = 0
let currentY = 0
let currentScale = 1

let stage
let handler:IInputsHandler

let touchMode = false
let startedZooming = false
let inMultiToucheMode = false
let initTouchesDistance:number
let initScale:number
let prevMultiTouchCenterX:number
let prevMultiTouchCenterY:number


export function setInputsHandler(inputsHandler:IInputsHandler) {
    handler = inputsHandler
}

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
        if (e.ctrlKey || e.button === MIDDLE_BUTTON_CODE) {
            touchMode = false
            offsetX = e.clientX - currentX
            offsetY = e.clientY - currentY
            e.preventDefault()
        } else {
            handler.onTouchStart(createEvent(e.clientX, e.clientY, e))
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    function onMouseUp(e) {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        if (!e.ctrlKey && e.button !== MIDDLE_BUTTON_CODE) {
            handler.onTouchEnd()
        }
    }

    function onMouseMove(e) {
        if (e.ctrlKey || e.button === MIDDLE_BUTTON_CODE) {
            moveStage(e.clientX - offsetX, e.clientY - offsetY)
            e.preventDefault()
        } else {
            handler.onTouchMove(createEvent(e.clientX, e.clientY, e))
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

    function onTouchStart(e) {
        log.log('m', '--onTouchStart')
        if (!inMultiToucheMode) {
            touchMode = true

            let touch = e.touches[0]
            touchStartX = touch.clientX
            touchStartY = touch.clientY
            handler.onTouchStart(createEvent(touch.clientX, touch.clientY, e))

            document.addEventListener('touchmove', onTouchMove)
            document.addEventListener('touchend', onTouchEnd)
            document.addEventListener('touchstart', onSecondTouch, true)
        }
    }

    function onTouchMove(e) {
        if (!inMultiToucheMode) {
            let touch = e.touches[0]
            handler.onTouchMove(createEvent(touch.clientX, touch.clientY, e))
        }
    }

    function onTouchEnd() {
        if (!inMultiToucheMode) {
            handler.onTouchEnd()

            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
            document.removeEventListener('touchstart', onSecondTouch, true)
        }
    }

    // multitouch

    function onSecondTouch(e) {
        log.log('m', '--onSecondTouch')
        let firstTouch = e.touches[0]
        let secondTouch = e.touches[1]
        if (secondTouch) {
            handler.onSecondTouchStart()

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
        if (e.touches.length < 2) {
            return
        }

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
        } else {
            moveStage(currentX + deltaX, currentY + deltaY)
        }

        prevMultiTouchCenterX = newCenterX
        prevMultiTouchCenterY = newCenterY

        e.preventDefault()
    }

    function onMultiTouchUp():void {
        inMultiToucheMode = false
        document.removeEventListener('touchmove', onMultiTouchMove)
        document.removeEventListener('touchup', onMultiTouchUp)
    }
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

function createEvent(x:number, y:number, e):IInputsHandlerEvent {
    return {
        x,
        y,
        preventDefault: () => e.preventDefault()
    }
}