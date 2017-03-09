import BaseWidget from './BaseWidget'

const template = () => `
<div class="mockup-view mockup-view-2016 mockup-prototyping-view select-2016 full-size">
    <table class="rounded border" style="border-color: inherit">
        <tr>
            <td>
                <div contenteditable="true" class="text align-left font-size-14" style="color: inherit" >Select</div>
            </td>
            <td width="40">
                <svg width="40px" height="9px" viewBox="0 0 14 9" version="1.1" xmlns="http://www.w3.org/2000/svg" style="color: inherit">
                    <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="sel" fill="currentColor">
                            <polygon points="7 8.41421356 13.7071068 1.70710678 12.2928932 0.292893219 6.99999981 5.49999981 1.70710678 0.292893219 0.292893219 1.70710678"></polygon>
                        </g>
                    </g>
                </svg>
            </td>
        </tr>
    </table>
</div>`

export default class TextLineWidget extends BaseWidget {

    constructor(width:number, height:number, color:string) {
        super(width, height, color)
        this.getElement().append($(template()))
    }

    getMinSize():{ width; height } {
        return {
            width: 80,
            height: 20
        }
    }

    isEditModeAvailable() {
        return true
    }
}