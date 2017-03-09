import BaseWidget from './BaseWidget'

const template = (p) => `
<div class="mockup-view mockup-view-2016 mockup-prototyping-view full-size border" 
style="width: ${p.width}px; height: ${p.height}px; border-color: ${p.color}">
</div>`

export default class DebugWidget extends BaseWidget {

    private w:JQuery

    constructor(width:number, height:number) {
        super(width, height)
        this.w = $(template({width, height, color: '#FF0000'}))
        this.getElement().append(this.w)
    }

    applyParams(params) {
        this.w.get(0).innerHTML = params.name
    }
}