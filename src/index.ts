import * as mover from "./canvas/mover/mover"
import {initRecognizer} from "./canvas/drawer"
import WidgetsController from "./canvas/WidgetsController"
import UIController from "./ui/UIController"

let stage = document.getElementById('baseContainer')
mover.init(stage)

let widgetsController = new WidgetsController()
widgetsController.setUIController(new UIController(widgetsController))

mover.setInputsHandler(widgetsController.inputsHandler)

initRecognizer(widgetsController)