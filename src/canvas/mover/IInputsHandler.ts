import IInputsHandlerEvent from './IInputsHandlerEvent'

export interface IInputsHandler {
    setDrawCallbacks(startDrawCallback, continueDrawCallback, stopDrawCallback):void

    onTouchStart(e:IInputsHandlerEvent):void
    onTouchMove(e:IInputsHandlerEvent):void
    onTouchEnd():void
    onSecondTouchStart():void
}

export default IInputsHandler