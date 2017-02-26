import BaseWidget from "./widgets/BaseWidget";
import PictureWidget from "./widgets/PictureWidget";
import TextBoxWidget from "./widgets/TextBoxWidget"
import ButtonWidget from "./widgets/ButtonWidget"
import RectangleWidget from "./widgets/RectangleWidget"
import CircleWidget from "./widgets/CircleWidget"
import LineWidget from "./widgets/LineWidget"
import DebugWidget from "./widgets/DebugWidget"
import TextLineWidget from "./widgets/TextLineWidget"
import ParagraphWidget from "./widgets/ParagraphWidget"
import HeadLineWidget from "./widgets/HeadLineWidget"
import ComboBoxWidget from "./widgets/ComboBoxWidget"
import ArrowWidget from "./widgets/ArrowWidget"
import VLineWidget from "./widgets/VLineWidget"
import UIController from "../ui/UIController"

import IRect from "./mover/types/IRect"
import WidgetTypes from "./widgets/WidgetTypes"
import InputsHandler from "./InputsHandler"

export default class WidgetsController {

    private ui:UIController
    private widgetConstructors
    private widgets:BaseWidget[] = []
    private selectedWidget:BaseWidget | null

    inputsHandler:InputsHandler

    constructor() {
        this.widgetConstructors = {
            [WidgetTypes.DEBUG]: DebugWidget,
            [WidgetTypes.PICTURE]: PictureWidget,
            [WidgetTypes.TEXTFIELD]: TextBoxWidget,
            [WidgetTypes.BUTTON]: ButtonWidget,
            [WidgetTypes.RECTANGLE]: RectangleWidget,
            [WidgetTypes.CIRCLE]: CircleWidget,
            [WidgetTypes.LINE]: LineWidget,
            [WidgetTypes.TEXTLINE]: TextLineWidget,
            [WidgetTypes.PARAGRAPH]: ParagraphWidget,
            [WidgetTypes.HEADLINE]: HeadLineWidget,
            [WidgetTypes.COMBOBOX]: ComboBoxWidget,
            [WidgetTypes.ARROW]: ArrowWidget,
            [WidgetTypes.VLINE]: VLineWidget
        }

        this.inputsHandler = new InputsHandler(this)
    }

    setUIController(ui:UIController) {
        this.ui = ui
    }

    createWidget(widgetType:string, positionAndSize:IRect, params:any) {
        if (!widgetType) {
            return
        }

        let widget:BaseWidget = new this.widgetConstructors[widgetType](positionAndSize.width, positionAndSize.height)
        widget.setPosition(positionAndSize.x, positionAndSize.y)
        widget.applyParams(params)
        this.attachWidget(widget)

        this.widgets.push(widget)

        this.selectWidget(widget)
    }

    private attachWidget(w:BaseWidget) {
        let baseContainer = document.getElementById('baseContainer')
        $(baseContainer!).append(w.getElement())
    }

    getWidgetUnderPoint(x:number, y:number):BaseWidget {
        let res = this.getWidgetOrButtonUnderPoint(x, y)
        return res.widget
    }

    getWidgetOrButtonUnderPoint(x, y):{ widget; isWidget; isButton } {
        let target = document.elementFromPoint(x, y)
        while (target !== null
        && target !== document.body
        && !target.classList.contains('base-widget')
        && !target.classList.contains('context-menu-button')) {
            target = target.parentElement
        }
        let $target = $(target)
        let isButton = !!$target.data('button')
        let id = parseInt($target.data('id'), 10)
        return {
            widget: this.widgets.find((w) => w.id === id),
            isWidget: id > 0 && !isButton,
            isButton: id > 0 && isButton
        }
    }

    selectWidget(widget:BaseWidget) {
        widget.setSelected(true)
        this.selectedWidget = widget
        this.ui.showContextMenu()
    }

    deselectSelectedWidget() {
        if (this.selectedWidget) {
            this.selectedWidget.setSelected(false)
            this.selectedWidget = null
            this.ui.hideContextMenu()
        }
    }

    getSelectedWidget() {
        return this.selectedWidget
    }

    removeWidget(widget:BaseWidget) {
        let widgetIndex = this.widgets.findIndex((w) => w === widget)
        this.widgets.splice(widgetIndex, 1)
        let baseContainer = document.getElementById('baseContainer')
        widget.getElement().remove()
    }
}
