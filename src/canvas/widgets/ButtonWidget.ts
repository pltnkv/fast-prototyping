import BaseWidget from './BaseWidget'

const template = () => `
<div class="mockup-view mockup-view-2016 mockup-prototyping-view button full-size">
	<table>
        <tr>
            <td class="border rounded" style="border-color: inherit; background-color: inherit">
                <div contenteditable="true" class="text align-center font-size-14" style="color: #ffffff">Button</div>
            </td>
        </tr>
    </table>
</div>    
		`

export default class ButtonWidget extends BaseWidget {

    constructor(width:number, height:number, color:string) {
        let buttonColor = color || '#000'
        super(width, height, buttonColor)
        this.getElement().append($(template()))
        this.setColor(buttonColor)
    }

    setColor(color:string) {
        if (!this.getElement().children().length) {
            return
        }

        this.getElement().find('.border').css({
            'border-color': color,
            'background-color': color
        })
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
