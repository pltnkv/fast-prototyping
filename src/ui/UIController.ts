import * as contextMenu from "./ContextMenu"
import WidgetsController from "../canvas/WidgetsController"

export default class UIController {

    private uiHandler:IUIHandler

    constructor(widgetsController:WidgetsController) {
        this.uiHandler = {
            onDelete: () => {
                widgetsController.removeWidget(widgetsController.getSelectedWidget())
            },
            onSetColor: (color) => {
                widgetsController.getSelectedWidget().setColor(color)
            }
        }

        contextMenu.init(this.uiHandler)
        this.initLegend()
    }

    private initLegend() {
        let legend = document.getElementById('legend') as HTMLElement
        let displayLegend = document.getElementById('displayLegend') as HTMLElement
        displayLegend.addEventListener('touchstart', (e) => {
            $(legend).fadeIn(200)
            e.stopPropagation()
        }, true)

        let hideLegend = $('.legend-overlay')[0]
        hideLegend.addEventListener('touchstart', (e) => {
            $(legend).fadeOut(200)
            e.stopPropagation()
        }, true)

    }

    showContextMenu() {
        contextMenu.showContextMenu()
    }

    hideContextMenu() {
        contextMenu.hideContextMenu()
    }
}