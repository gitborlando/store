HTMLElement.prototype.drag = function (mousePosition) {
    let positionShift = []
    let onMouseMove = function (event) {
        this.setThisPosition(event.pageX, event.pageY)
    }.bind(this)
    this.setThisPosition = function (pageX, pageY) {
        this.style.left = pageX - positionShift[0] + 'px'
        this.style.top = pageY - positionShift[1] + 'px'
    }
    this.onMouseUp = function () {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', () => { this.onMouseUp() })
    }
    this.ondragstart = function () { return false }
    this.style.position = 'absolute'
    this.style.zIndex = 1000
    document.body.append(this)
    positionShift[0] = mousePosition.clientX - this.getBoundingClientRect().left
    positionShift[1] = mousePosition.clientY - this.getBoundingClientRect().top
    this.setThisPosition(mousePosition.pageX, mousePosition.pageY)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', () => { this.onMouseUp() })
}