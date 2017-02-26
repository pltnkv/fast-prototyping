import BaseWidget from "./BaseWidget"

const template = () => `
<div class="mockup-view mockup-view-2016 mockup-prototyping-view line"></div>`

export default class LineWidget extends BaseWidget {

    constructor(width:number, height:number, color:string) {
        super(width, height, color, 1)
        this.getElement().append($(template()))
    }
}