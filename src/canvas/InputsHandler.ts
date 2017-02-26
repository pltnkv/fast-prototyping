import IInputsHandler from "./mover/IInputsHandler";
import WidgetsController from "./WidgetsController";
import IInputsHandlerEvent from "./mover/IInputsHandlerEvent";
import BaseWidget from "./widgets/BaseWidget";
import * as mover from "./mover/mover"
import {discreteRound} from "./mover/utils";

const DOUBLE_TOUCH_TIME = 350
const MOVE_STEP = 10

enum HandlerMode {
    DRAW,
    MOVE,
    RESIZE,
    EDIT,
    DISABLED
}

export default class InputsHandler implements IInputsHandler {

    private widgetsController:WidgetsController

    private startDrawCallback
    private continueDrawCallback
    private stopDrawCallback

    private mode:HandlerMode = HandlerMode.DRAW

    private needToSelect = false
    private prevTouchTime:number
    private touchStartX:number
    private touchStartY:number

    private savedOffsetX:number
    private savedOffsetY:number
    private savedWidth:number
    private savedHeight:number

    constructor(controller:WidgetsController) {
        this.widgetsController = controller
    }

    setDrawCallbacks(startDrawCallback, continueDrawCallback, stopDrawCallback) {
        this.startDrawCallback = startDrawCallback
        this.continueDrawCallback = continueDrawCallback
        this.stopDrawCallback = stopDrawCallback
    }

    onTouchStart(e:IInputsHandlerEvent) {
        log.log('w', 'onTouchStart')
        this.mode = HandlerMode.DRAW
        this.needToSelect = false
        this.touchStartX = e.x
        this.touchStartY = e.y

        let currentTouchTime = Date.now()
        let {widget, isButton} = this.widgetsController.getWidgetOrButtonUnderPoint(e.x, e.y)

        let clickByAlreadySelectedWidget = !!widget && widget === this.widgetsController.getSelectedWidget()
        if (clickByAlreadySelectedWidget) {
            if (currentTouchTime - this.prevTouchTime < DOUBLE_TOUCH_TIME && widget.isEditModeAvailable()) {
                this.mode = HandlerMode.EDIT
                widget.setEditMode(true)
            } else {
                this.mode = isButton ? HandlerMode.RESIZE : HandlerMode.MOVE
                this.saveOffsetForWidget(widget, e.x, e.y)
            }
        } else {
            this.needToSelect = true
            this.startDrawCallback(e.x, e.y)
        }

        this.prevTouchTime = currentTouchTime

        if (this.mode !== HandlerMode.EDIT) {
            e.preventDefault()
        }
    }

    onTouchMove(e:IInputsHandlerEvent) {
        console.log('onTouchMove')
        let widget = this.widgetsController.getSelectedWidget()

        switch (this.mode) {
            case HandlerMode.DRAW:
                this.continueDrawCallback(e.x, e.y)

                const THRESHOLD = 5
                if (this.needToSelect && (Math.abs(e.x - this.touchStartX) > THRESHOLD || Math.abs(e.y - this.touchStartY) > THRESHOLD)) {
                    this.deselectWidget()
                    this.needToSelect = false
                }
                break;
            case HandlerMode.MOVE:
                this.moveWidget(widget, e.x, e.y)
                break;
            case HandlerMode.RESIZE:
                this.resizeWidget(widget, e.x, e.y)
                break;
        }
        e.preventDefault()
    }

    onTouchEnd() {
        log.log('w', 'onTouchEnd')
        if (this.needToSelect) {
            this.selectWidget(this.touchStartX, this.touchStartY)
            this.stopDrawCallback(true)
        } else if (this.mode === HandlerMode.DRAW) {
            this.stopDrawCallback()
        } else {
            this.stopDrawCallback(true)
        }
    }


    onSecondTouchStart() {
        log.log('w', 'onSecondTouchStart')
        this.needToSelect = false
        this.stopDrawCallback(true)
        this.mode = HandlerMode.DISABLED
    }

    //////////////////////////////
    // helpers
    //////////////////////////////


    private moveWidget(widget, x, y) {
        let newX = mover.getScreenToCanvasX(x) - this.savedOffsetX
        let newY = mover.getScreenToCanvasY(y) - this.savedOffsetY
        widget.setPosition(discreteRound(newX, MOVE_STEP), discreteRound(newY, MOVE_STEP))
    }


    private resizeWidget(widget, x, y) {
        let minSize = widget.getMinSize()
        let newWidth = Math.max(minSize.width, this.savedWidth + mover.getScreenToCanvasX(x) - this.savedOffsetX, MOVE_STEP)
        let newHeight = Math.max(minSize.height, this.savedHeight + mover.getScreenToCanvasY(y) - this.savedOffsetY, MOVE_STEP)
        widget.setSize(
            discreteRound(newWidth, MOVE_STEP),
            discreteRound(newHeight, MOVE_STEP)
        )
    }

    private saveOffsetForWidget(w:BaseWidget, x:number, y:number) {
        let widgetPos = w.getPosition()
        if (this.mode === HandlerMode.RESIZE) {
            let size = w.getSize()
            this.savedOffsetX = mover.getScreenToCanvasX(x)
            this.savedOffsetY = mover.getScreenToCanvasY(y)
            this.savedWidth = size.width
            this.savedHeight = size.height
        } else { //moving
            this.savedOffsetX = mover.getScreenToCanvasX(x) - widgetPos.x
            this.savedOffsetY = mover.getScreenToCanvasY(y) - widgetPos.y
        }
    }

    private selectWidget(x, y) {
        this.widgetsController.deselectSelectedWidget()
        let w = this.widgetsController.getWidgetUnderPoint(x, y)
        if (w) {
            this.widgetsController.selectWidget(w)
        }
    }

    private deselectWidget() {
        this.widgetsController.deselectSelectedWidget()
    }
}