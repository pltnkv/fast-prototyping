import BaseWidget from './BaseWidget'

// const template = (p) => `
// <div class="mockup-prototyping-view placeholder border" style="border-color: ${p.color}">
// 	<svg viewBox="0 0 58 58" fill="${p.color}" xmlns="http://www.w3.org/2000/svg">
// 	  <g transform="matrix(1, 0, 0, 1, 0.120269, 0.240538)">
// 		<!--<path d="M 1.396 1.302 L 1.396 56.192 L 56.286 56.192 L 56.286 1.302 L 1.396 1.302 Z M 57.73 -0.142 L 57.73 57.637 L -0.048 57.637 L -0.048 -0.142 L 57.73 -0.142 Z"
// id="Rectangle-5"/>--> <polygon id="Path-117" points="18.73 32.359 24.508 38.437 34.619 28.025 44.219 37.926 45.242 36.904 34.619 26.282 24.508 36.692 18.73 30.615 12.44 36.904
// 13.463 37.926"/> <circle id="Oval-192" cx="24.508" cy="24.414" r="4.333"/> </g> </svg> </div>`

const template = () => `
<div style="width: 100%; height: 100%;">
<input type="file" class="file-input-pic" accept="image/jpeg,image/png,image/gif,image/bmp" 
style="display: block; position: absolute; width: 100%; height: 100%; opacity: 0.01">

<div class="img-container" style="display: none; position: absolute; width: 100%; height: 100%; background-size: cover; background-position: center;"></div>

<svg xmlns="http://www.w3.org/2000/svg" class="mockup-prototyping-view full-size">
        <rect fill="none" stroke-width="4" stroke="currentColor" width="100%" height="100%"></rect>
        <line fill="none" stroke-width="2" stroke="currentColor" x1="0" y1="0" x2="100%" y2="100%"></line>
        <line fill="none" stroke-width="2" stroke="currentColor" x1="0" y1="100%" x2="100%" y2="0"></line>
</svg> 
<div>`

export default class PictureWidget extends BaseWidget {

    constructor(width:number, height:number, color:string) {
        super(width, height, color)
        this.getElement().append($(template()))

        this.getElement().find(('.file-input-pic'))
            .on('click', (e) => {
                e.stopPropagation()
            })
            .on('change', () => {
                let input:any = this.getElement().find(('.file-input-pic'))[0]
                if (input.files && input.files[0]) {
                    var reader = new FileReader()
                    reader.onload = (e:any) => {
                        this.getElement().find(('.img-container'))
                            .css({
                                display: 'block',
                                backgroundImage: `url('${e.target.result}')`
                            })
                        this.getElement().find(('.mockup-prototyping-view')).hide()
                    }
                    reader.readAsDataURL(input.files[0])
                }
            })
    }

    isEditModeAvailable() {
        return true
    }

    setEditMode(value:boolean) {
        // $('#fileInput').click()
    }
}
