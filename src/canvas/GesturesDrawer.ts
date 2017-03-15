import IRect from './mover/types/IRect'
import IPoint from './mover/types/IPoint'
const simplify = require('simplify-js')

export default class GesturesDrawer {
    private ctx:CanvasRenderingContext2D
    private canvasRect:IRect

    constructor() {
        let canvas = <any>document.getElementById('strokeCanvas')
        this.ctx = canvas.getContext('2d')
        this.ctx.lineWidth = 1.5

        this.canvasRect = this.getCanvasRect(canvas)
    }

    startNewStroke(pos:IPoint) {
        const clr = '#6699FF'
        this.ctx.strokeStyle = clr
        this.ctx.fillStyle = clr
        this.ctx.fillRect(pos.x - 1, pos.y - 1, 2, 2)
    }

    drawConnectedPoint(currentGesture, from, to) {
        this.ctx.beginPath()
        this.ctx.moveTo(currentGesture.points[from].x, currentGesture.points[from].y)
        this.ctx.lineTo(currentGesture.points[to].x, currentGesture.points[to].y)
        this.ctx.closePath()
        this.ctx.stroke()
    }

    drawSimplifiedStroke(_points:IPoint[]) {
        log.log('drw', '_points.length', _points.length)
        if (_points.length >= 2) {
            let simplPoints = simplify(_points, 10)
            log.log('drw', 'simplPoints.length', simplPoints.length)

            const clr = '#990000'
            this.ctx.beginPath()
            this.ctx.strokeStyle = clr
            this.ctx.fillStyle = clr
            this.ctx.moveTo(simplPoints[0].x, simplPoints[0].y)
            for (let i = 1; i < simplPoints.length; i++) {
                this.ctx.lineTo(simplPoints[i].x, simplPoints[i].y)
            }
            this.ctx.stroke()
        }
    }

    drawBoundingBox(rect:IRect) {
        let clr = '#0a9900'
        this.ctx.beginPath()
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height)
        this.ctx.strokeStyle = clr
        this.ctx.stroke()
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvasRect.width, this.canvasRect.height)
    }

    private getCanvasRect(canvas) {
        let w = canvas.width
        let h = canvas.height

        let cx = canvas.offsetLeft
        let cy = canvas.offsetTop
        while (canvas.offsetParent != null) {
            canvas = canvas.offsetParent
            cx += canvas.offsetLeft
            cy += canvas.offsetTop
        }
        return {x: cx, y: cy, width: w, height: h}
    }

}