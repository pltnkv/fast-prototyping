import * as contextMenu from "./ContextMenu"
import WidgetsController from "../widgets/WidgetsController"

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
    }

    showContextMenu() {
        contextMenu.showContextMenu()
    }

    hideContextMenu() {
        contextMenu.hideContextMenu()
    }
}