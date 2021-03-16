HTMLElement.prototype.drag = function (mousePosition) {
    let positionShift = []
    this.setThisPosition = function (pageX, pageY) {
        this.style.left = pageX - positionShift[0] + 'px'
        this.style.top = pageY - positionShift[1] + 'px'
    }
    this.onMouseMove = function (event) {
        this.setThisPosition(event.pageX, event.pageY)
    }
    this.onMouseUp = function () {
        this.removeEventListener('mousemove', this.onMouseMove)
    }
    this.ondragstart = function () { return false }
    this.addEventListener('mouseup', this.onMouseUp)
    this.style.position = 'absolute'
    this.style.zIndex = 1000
    document.body.append(this)
    positionShift[0] = mousePosition.clientX - this.getBoundingClientRect().left
    positionShift[1] = mousePosition.clientY - this.getBoundingClientRect().top
    this.setThisPosition(mousePosition.pageX, mousePosition.pageY)
    this.addEventListener('mousemove', this.onMouseMove)
}