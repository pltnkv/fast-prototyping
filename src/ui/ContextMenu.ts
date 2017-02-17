let contextMenu:JQuery
let colorMenu:JQuery
let handler:IUIHandler

export function init(uiHandler:IUIHandler) {
    handler = uiHandler
    contextMenu = $('#contextMenu')
    colorMenu = $('#colorMenu')

    colorMenu.find('.color-button').each((index, button) => {
        button.addEventListener('touchstart', (e) => {
            e.stopPropagation()
            handler.onSetColor($(button).css('background-color'))
        }, true)
    })

    $('#contextMenu__color')[0].addEventListener('touchstart', (e) => {
        e.stopPropagation()
        showColorMenu()
    }, true)

    $('#contextMenu__delete')[0].addEventListener('touchstart', (e) => {
        e.stopPropagation()
        handler.onDelete()
        hideContextMenu()
    }, true)
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