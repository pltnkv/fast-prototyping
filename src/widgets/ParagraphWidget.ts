import BaseWidget from "./BaseWidget"

const LINE_HEIGHT = 16;

const template = () => `
<div class="mockup-view mockup-view-2016 mockup-prototyping-view textline full-size">
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</div>`

export default class TextLineWidget extends BaseWidget {

    constructor(width:number, height:number, color:string) {
        super(width, height, color)
        this.getElement().append($(template()))
    }

    setSize(width:number, height:number) {
        this.setWidth(width)
        let paragraphHeight = height ? Math.floor(height / LINE_HEIGHT) * LINE_HEIGHT : LINE_HEIGHT
        this.setHeight(paragraphHeight)
    }
}