HTMLElement.prototype.FrameDrag = function (option) {
    this.xOnly = option.xOnly ?? false //仅x轴可拖拽,下同
    this.yOnly = option.yOnly ?? false
    this.startPosition = []
    this.curentPosition = []
    this.positionShift = [] //当鼠标第一次点击时与this的位移差
    this.positionDisplacement = [] //拖拽后this的当前位置与最初位置的位移差
    this.callback = null
    let onMouseMove = function (event) { //鼠标移动时运行{ 不断设置this的位置及运行回调函数 },event=>鼠标事件,
        this.setThisPosition(event.pageX, event.pageY)
        this.positionDisplacement = this.getDisplacement(this.startPosition)
        this.callback(this.positionDisplacement[0], this.positionDisplacement[1]) //回调函数//参数=>x位移差,y轴位移差
    }.bind(this)
    this.onMouseUp = function () { //鼠标抬起,移除鼠标移动和鼠标抬起的事件
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', () => { this.onMouseUp() })
    }
    this.setThisPosition = function (pageX, pageY) { //设置this的位置,在onMouseMove中调用
        if (!this.yOnly) this.style.left = pageX - this.positionShift[0] + 'px'
        if (!this.xOnly) this.style.top = pageY - this.positionShift[1] + 'px'
    }
    this.getPosition = function () { //在this.getDisplacement()和this.startDrag()中调用,返回this的当前位置
        let left = parseFloat(getComputedStyle(this).getPropertyValue('left'))
        let top = parseFloat(getComputedStyle(this).getPropertyValue('top'))
        this.curentPosition = [left, top]
        return this.curentPosition
    }
    this.getDisplacement = function (startPosition) { //返回this拖拽时的位移差,在onMouseMove中调用
        let x = this.getPosition()[0] - startPosition[0]
        let y = this.getPosition()[1] - startPosition[1]
        return [x, y]
    }
    this.startDrag = function (callback) { //主要初始化一些数据,并设置监听事件
        this.callback = callback
        return (mousePosition) => { 
            this.style.position = 'absolute' 
            this.style.zIndex = 1000
            document.body.append(this)
            this.startPosition = this.getPosition() 
            this.positionShift[0] = mousePosition.clientX - this.getBoundingClientRect().left // //当鼠标第一次点击时与this的位移差
            this.positionShift[1] = mousePosition.clientY - this.getBoundingClientRect().top
            this.setThisPosition(mousePosition.pageX, mousePosition.pageY) //初始化this的位置
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', () => { this.onMouseUp() })
        }
    }
    this.ondragstart = function () { return false } //清除默认拖拽事件
    return this // 返回this,供this.startDrag链式调用
}

/*Useage*/ //使用方法

// d1.onmousedown = d1.FrameDrag({
//     xOnly: false, //是否仅x轴可拖拽
//     yOnly: false
// }).startDrag((x, y) => { //可插入一个回调函数,参数=>元素拖拽时与初始位置的位移差
//     x = 100 && console.log('移动了100px')
// })