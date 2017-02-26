let idIncrement = 1

export default class BaseWidget {
    id = ++idIncrement

    lockedHeight

    private element:JQuery
    private contextMenuButton:JQuery
    private pos = {x: 0, y: 0}
    protected size = {width: 0, height: 0}

    constructor(width?:number, height?:number, color?:string, lockedHeight = 0) {
        this.lockedHeight = lockedHeight
        this.element = this.createWrapperElement()
        this.contextMenuButton = this.createContextMenuButton()
        this.setSize(width, height)
        this.setColor(color)
    }

    private createWrapperElement():JQuery {
        return $(`<div class="base-widget" data-id="${this.id}"></div>`)
    }

    private createContextMenuButton():JQuery {
        return $(`<div class="context-menu-button ${this.lockedHeight !== 0 ? 'context-menu-button--locked' : '' }"  
					data-button="true" data-id="${this.id}"></div>`)
    }

    getElement() {
        return this.element
    }

    setPosition(x:number, y:number) {
        this.pos.x = x
        this.pos.y = y
        this.element.css({
            left: x,
            top: y
        })
    }

    getPosition():{ x; y } {
        return this.pos
    }

    applyParams(params) {
    }

    setSize(width:number, height:number) {
        this.setWidth(width)
        this.setHeight(height)
    }

    protected setWidth(value) {
        this.size.width = value
        this.element.width(value)

    }

    protected setHeight(value) {
        if (this.lockedHeight === 0) {
            this.size.height = value
            this.element.height(value)
        }
    }

    getSize():{ width; height } {
        return this.size
    }

    setColor(color:string) {
        this.element.css({
            color,
            'border-color': color
        })
    }

    setSelected(value:boolean) {
        this.element.css({
            outline: value ? '1.5px solid #6699ff' : 'none'
        })
        if (value) {
            this.element.append(this.contextMenuButton)
        } else {
            this.contextMenuButton.remove()
        }
    }

    getMinSize():{ width; height } {
        return {
            width: 20,
            height: 20
        }
    }

    isEditModeAvailable() {
        return false
    }

    setEditMode(value:boolean) {
        // alert(value)
    }
}
