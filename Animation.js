HTMLElement.prototype.FrameAnimation = function (option) {
    this.start = 0 
    this.movingCurve = 0 
    this.percent = 0 
    this.state = -1 
    this.prohibition = 0 
    this.stopAnimation = 0 
    this.attrList = [] 
    this.rangeList = [] 
    this._rangeList = [] 
    this.timingList = [] 
    this.originAttrList = []
    this._originAttrList = []
    this.animations = option.animation
    this.duration = option.duration
    this.freezen = option.freezen ?? true
    if (this.animations.constructor == {}.constructor) this.animations = [this.animations]
    this.animations.forEach((each) => {
        this.rangeList = [...this.rangeList, ...Object.values(each).filter((i) => { return !(i instanceof Function) })]
        this.attrList = [...this.attrList, ...Object.keys(each).filter((i) => { return this.rangeList.includes(each[i]) })]
        this.eachTiming = Object.values(each).filter((i) => { return i instanceof Function }).length !== 0 ?
            Object.values(each).filter((i) => { return i instanceof Function }) : [undefined]
        this.timingList = [...this.timingList, ...this.eachTiming]
    })
    this.getOriginAttrList = function () {
        let aList = []
        this.attrList.forEach((each) => {
            let _each = ''
            if (['rotate', 'skew', 'scale', 'translate'].includes(each)) {
                _each = each; each = 'transform'
            }
            let originAttr = getComputedStyle(this).getPropertyValue(each)
            if (originAttr == 'none') originAttr = 'matrix(1, 0, 0, 1, 0, 0)'
            if (!(originAttr.match(/matrix/))) { originAttr = parseFloat(originAttr) } else {
                originAttr = _each + originAttr
            }
            aList.push(originAttr)
        })
        return aList
    }
    this.sinCosToAngle = function (matrix) {
        let cos = parseFloat(matrix.match(/(?<=\().+(?=\))/)[0].split(',')[0])
        return parseFloat((Math.acos(cos) / Math.PI * 180).toFixed(2))
    }
    this.angleToSinCos = function (angle) {
        let sin = Math.sin(angle / 180 * Math.PI).toFixed(6)
        let cos = Math.cos(angle / 180 * Math.PI).toFixed(6)
        return [parseFloat(sin), parseFloat(cos)]
    }
    this.matrixToScale = function (matrix) {
        let scale = parseFloat(matrix.match(/(?<=\().+(?=\))/)[0].split(',')[0])
        return scale
    }
    this.getRangeAndUnit = function (each) {
        let unit = (typeof each == 'string' && each.match(/[^-?\d*\.?\d*]+/)) ?
            each.match(/[^-?\d*\.?\d*]+/)[0] : 0
        let range = parseFloat(each)
        return [range, unit]
    }
    let newList = []
    this.rangeList.forEach((each) => {
        each = this.getRangeAndUnit(each)
        newList.push(each)
    })
    this.rangeList = this._rangeList = newList
    this.originAttrList = this.getOriginAttrList()
    this.render = function (direction, callback) {
        if (this.prohibition) return
        this.prohibition = 1
        if (this.freezen) {
            if ((-1) ** direction == this.state) return
            this.state = (-1) ** direction
        }
        this.start = performance.now()
        this.rangeList = direction == 1 ? this.rangeList.map((i) => { return [i[0] * (-1), i[1]] }) : this._rangeList
        this.originAttrList = this._originAttrList.length == 0 ? this.originAttrList : this._originAttrList
        requestAnimationFrame(function animate(NowTime) {
            this.attrList.forEach((each, index) => {
                let timing = this.timingList[index]
                this.rangeAndUnit = this.rangeList[index]
                this.percent = (NowTime - this.start) / this.duration
                this.percent = this.percent > 1 ? 1 : this.percent
                this.movingCurve = timing ? timing(this.percent) : this.percent
                if (typeof this.originAttrList[index] == 'string' && this.originAttrList[index].match(/matrix/)) {
                    if (this.originAttrList[index].match(/rotate/)) {
                        let angle = this.sinCosToAngle(this.originAttrList[index])
                            + this.rangeAndUnit[0] * this.movingCurve + this.rangeAndUnit[1]
                        let sin = this.angleToSinCos(angle)[0]
                        let cos = this.angleToSinCos(angle)[1]
                        this.style.transform = `matrix(${cos}, ${sin}, ${-1 * sin}, ${cos}, 0, 0)`
                    } else if (this.originAttrList[index].match(/scale/)) {
                        let originScale = this.matrixToScale(this.originAttrList[index])
                        let scale = originScale + (this.rangeAndUnit[0] - 1) * this.movingCurve + this.rangeAndUnit[1]
                        this.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`
                    }
                }
                else {
                    this.style[each] = this.originAttrList[index] + this.rangeAndUnit[0] * this.movingCurve + this.rangeAndUnit[1]
                }
            })
            if (this.percent < 1) {
                if (this.stopAnimation) return
                requestAnimationFrame(animate.bind(this))
            } else {
                this.prohibition = 0
                this._originAttrList = this.getOriginAttrList()
            }
            if (callback instanceof Function) callback(this.percent)
        }.bind(this))
    }
    this.startAnimation = function (...args) {
        return this.delayOrCallback(2, args)
    }
    this.turnBack = function (...args) {
        this.freezen = false
        return this.delayOrCallback(1, args)
    }
    this.loop = function (percent, backDelay, startDelay) {
        if (percent >= 1) this.turnBack((percent) => {
            if (percent >= 1) this.startAnimation((percent) => {
                this.loop(percent, backDelay, startDelay)
            }, startDelay)()
        }, backDelay)()
    }
    this.stop = function () {
        return () => { this.stopAnimation = 1 }
    }
    this.delayOrCallback = function (direction, args) {
        if (args.length == 0) return this.render.bind(this, direction)
        if (args.length == 1 && typeof args[0] == 'number') return this.Delay(args[0], direction)
        if (args.length == 1 && args[0] instanceof Function) return this.render.bind(this, direction, args[0])
        return this.Delay(args[1], direction, args[0])
    }
    this.Delay = function (delay, direction, callback) {
        return function () {
            setTimeout(() => {
                this.render(direction, callback)
            }, delay)
        }.bind(this)
    }
    return this
}

/*Useage*/

// d1.onclick = d1.FrameAnimation({ //注意=>类似transform:rotate(30deg)这种可以直接写成{'rotate': 30}的形式,left属性的单位不能用"%",transform不能
//     animation: [                 //多个属性同时动画{例如rotate和scale不能同时使用}=>别问,问就是我太菜了
//         { 'rotate': 360, timing: (p) => { return p } }, //要进行动画的属性,timing=>设置该属性的曲线函数{例如p**2},参数p是完成百分比{0~1之间}
//         { 'left': '300px', timing: (p) => { return Math.sqrt(p) } },
//         { 'scale': '1.5', timing: (p) => { return Math.sqrt(p) } },
//     ],
//     duration: 2500,//时间
//     freezen: true,// 这个属性意思是动画进行了一次后就不能再进行了{限制只运行一次},使用turnBack后可解锁
// }).startAnimation((p) => { //startAnimation接受一个回调函数和一个延迟时间{延迟x秒进行动画}作为参数,这个p仍然是完成百分比{0~1之间}
//     d1.loop(p, 1000, 1000) //loop作用是使动画循环播放,参数{p,1000,1000}=>{完成度,延迟1s原路返回,返回后再延迟1s重新开始动画,并循环调用}
//     if (p >= 1) d1.turnBack()() //if (p >= 1) turnBack()的作用是在动画结束后再原路返回,也接受一个回调函数和一个延迟时间
// }, 3000) //3000=>延迟时间,可以单写一个函数,也可以单写一个时间,两个都写当然也可以
// button.onclick = d1.stop() //动画停止

HTMLElement.prototype.FrameRippleEffect = function (option) {
    this.color = option.color
    this.range = option.range
    this.duration = option.duration
    this.timing = option.timing
    this.render = function (e) {
        let cir = document.createElement('div')
        cir.style['background-color'] = this.color
        cir.style['border-radius'] = '50%'
        cir.style['position'] = 'absolute'
        cir.style['width'] = '1px'
        cir.style['height'] = '1px'
        cir.style['left'] = e.clientX - parseFloat(getComputedStyle(this).getPropertyValue('left')) + 'px'
        cir.style['top'] = e.clientY - parseFloat(getComputedStyle(this).getPropertyValue('top')) + 'px'
        this.appendChild(cir)
        cir.FrameAnimation({
            animation: [
                { 'scale': this.range, timing: this.timing },
                { 'opacity': '-1', timing: this.timing }
            ],
            duration: this.duration
        }).startAnimation((p)=>{ if(p>=1) this.removeChild(cir) })()
    }
    this.addEventListener('mousedown', this.render)
    this.addEventListener('mouseup', ()=>{
        removeEventListener('mousedown', this.render)
    })
    this.style.overflow = 'hidden'
    return this
}

/*Useage*/

// btn.FrameRippleEffect({
//     color: 'rgb(255, 255, 255, 0.7)',//波浪颜色
//     range: '250', //波浪范围
//     duration: 800, //波浪时间 //范围除时间就是波浪的速度
//     timing: (p) => { return Math.sqrt(p) } //曲线函数
// })
