import WidgetType from './widgets/WidgetType'
import Gestures from './Gestures'
import IPoint from './mover/types/IPoint'
import * as gestures from './gesturesRecognizer'
import IRect from './mover/types/IRect'

type Stroke = IPoint[]

// ниже 0.7 может выдать полную хрень
const coefficients = {
    [WidgetType.DEBUG]: 1, // fake
    [WidgetType.TEXTLINE]: 0.9,
    [WidgetType.PARAGRAPH]: 0.78,
    [WidgetType.HEADLINE]: 0.83,
    [WidgetType.BUTTON]: 0.9,
    [WidgetType.COMBOBOX]: 0.8,
    [WidgetType.PICTURE]: 0.8,
    [WidgetType.RECTANGLE]: 0.85,
    [WidgetType.TEXTFIELD]: 0.8,
    [WidgetType.LINE]: 0.94,
    [WidgetType.VLINE]: 0.94,
    [WidgetType.CIRCLE]: 0.85,
    [WidgetType.ARROW]: 0.8,
    [WidgetType.ERASE]: 0.6
}

const finalizedGestures = [
    Gestures.RECTANGLE,
    Gestures.DOUBLE_LINE,
    Gestures.DOUBLE_LINE_V,
    Gestures.CIRCLE,
    Gestures.ERASE,
    Gestures.PICTURE
]

const widgetsByGestures = {
    [Gestures.RECTANGLE]: WidgetType.RECTANGLE,
    [Gestures.ERASE]: WidgetType.ERASE,
    [Gestures.CIRCLE]: WidgetType.CIRCLE,
    [Gestures.INPUT]: WidgetType.HEADLINE,
    [Gestures.DOUBLE_LINE]: WidgetType.LINE,
    [Gestures.DOUBLE_LINE_V]: WidgetType.VLINE,
    [Gestures.PICTURE]: WidgetType.PICTURE
}

const widgetsWithPoints = [WidgetType.HEADLINE]

// идея для оптимизации, чтобы не менять длину массива не бегать по массиву с помощью индексов
export default class GestureRecognizer {
    points:Stroke = []
    strokes:Stroke[] = []
    completedWithPoint = false

    completeStroke() {
        this.strokes.push(this.points.slice())
    }

    completeWithPoint() {
        this.completedWithPoint = true
    }

    addPoint(point:IPoint) {
        this.points.push(point)
    }

    clear() {
        this.completedWithPoint = false
        this.points.length = 0
        this.strokes.length = 0
    }

    clearPoints() {
        this.points.length = 0
    }

    recognize(bounds:IRect):WidgetType | null {
        if (bounds.width < 50 && bounds.height < 50) {
            return null
        } else {
            let res = this.recognizeInner()
            let widgetType = widgetsByGestures[res.name!]
            let needPoint = widgetsWithPoints.includes(widgetType)
            if (widgetType && (!needPoint || needPoint && this.completedWithPoint)) {
                return widgetType
            } else {
                return null
            }
        }
    }

    private recognizeInner():gestures.IRecognizeResult {
        let res
        if (this.strokes.length > 1 || (this.strokes.length === 1 && this.strokes[0].length >= 10)) {
            res = gestures.recognize(this.strokes)
        } else {
            res = {score: 0, name: null}
        }
        console.log('recognize', Gestures[res.name], res.score)
        return res
    }
}