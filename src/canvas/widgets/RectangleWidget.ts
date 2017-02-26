import BaseWidget from "./BaseWidget"

const template = () => `
<div class="mockup-view mockup-view-2016 mockup-prototyping-view full-size border"></div>`

export default class RectangleWidget extends BaseWidget {

    constructor(width:number, height:number, color:string) {
        super(width, height, color)
        this.getElement().append($(template()))
    }
}