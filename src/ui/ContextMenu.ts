let contextMenu:JQuery
let colorMenu:JQuery
let handler:IUIHandler

function addClickEvent(element:Element, handler:() => void) {
    let stopPropagationHandler = (e) => {
        e.stopPropagation()
    }
    element.addEventListener('mousedown', stopPropagationHandler)
    element.addEventListener('touchstart', stopPropagationHandler)
    element.addEventListener('click', handler)
}

export function init(uiHandler:IUIHandler) {
    handler = uiHandler
    contextMenu = $('#contextMenu')
    colorMenu = $('#colorMenu')

    colorMenu.find('.color-button').each((index, button) => {
        addClickEvent(button, () => {
            handler.onSetColor($(button).css('background-color'))
        })
    })

    addClickEvent($('#contextMenu__color')[0], () => {
        showColorMenu()
    })

    addClickEvent($('#contextMenu__delete')[0], () => {
        handler.onDelete()
        hideContextMenu()
    })
}

export function showContextMenu() {
    contextMenu
        .css("display", "flex")
        .hide()
        .fadeIn(100)
}

export function hideContextMenu() {
    contextMenu.fadeOut(100)
    hideColorMenu()
}

function showColorMenu() {
    colorMenu
        .css("display", "flex")
        .hide()
        .fadeIn(100)
}

function hideColorMenu() {
    colorMenu.fadeOut(100)
}