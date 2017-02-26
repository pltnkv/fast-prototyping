import BaseWidget from "./BaseWidget"
import hasJavaScriptFileExtension = ts.hasJavaScriptFileExtension

const template = () => `
<div class="mockup-view mockup-view-2016 mockup-prototyping-view input mockup-view-2016--multiline full-size">
    <table class="border rounded" style="border-color: inherit">
        <tr>
            <td>
                <div contenteditable="true" class="text align-left font-size-14" style="color: inherit">Text</div>
            </td>
        </tr>
    </table>
</div>`

export default class TextBoxWidget extends BaseWidget {

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
