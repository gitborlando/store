HTMLElement.prototype.FrameAnimation = function (option) {
    let start = 0
    let movingCurve = 0
    let percent = 0
    let state = -1
    let prohibition = 0
    let stopAnimation = 0
    let attrList = []
    let rangeList = []
    let _rangeList = []
    let timingList = []
    let originAttrList = []
    let _originAttrList = []
    let animations = option.animation
    let duration = option.duration
    let freezen = option.freezen === undefined ? true : option.freezen
    if (animations.constructor == {}.constructor) animations = [animations]
    animations.forEach((each) => {
        rangeList = [...rangeList, ...Object.values(each).filter((i) => { return !(i instanceof Function) })]
        attrList = [...attrList, ...Object.keys(each).filter((i) => { return rangeList.includes(each[i]) })]
        let eachTiming = Object.values(each).filter((i) => { return i instanceof Function }).length !== 0 ?
            Object.values(each).filter((i) => { return i instanceof Function }) : [undefined]
        timingList = [...timingList, ...eachTiming]
    })
    let Frame_getOriginAttrList = () => {
        let aList = []
        attrList.forEach((each) => {
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
    let Frame_sinCosToAngle = function (matrix) {
        let cos = parseFloat(matrix.match(/(?<=\().+(?=\))/)[0].split(',')[0])
        return parseFloat((Math.acos(cos) / Math.PI * 180).toFixed(2))
    }
    let Frame_angleToSinCos = function (angle) {
        let sin = Math.sin(angle / 180 * Math.PI).toFixed(6)
        let cos = Math.cos(angle / 180 * Math.PI).toFixed(6)
        return [parseFloat(sin), parseFloat(cos)]
    }
    let Frame_matrixToScale = function (matrix) {
        let scale = parseFloat(matrix.match(/(?<=\().+(?=\))/)[0].split(',')[0])
        return scale
    }
    let Frame_getRangeAndUnit = function (each) {
        let unit = (typeof each == 'string' && each.match(/[^-?\d*\.?\d*]+/)) ?
            each.match(/[^-?\d*\.?\d*]+/)[0] : 0
        let range = parseFloat(each)
        return [range, unit]
    }
    let newList = []
    rangeList.forEach((each) => {
        each = Frame_getRangeAndUnit(each)
        newList.push(each)
    })
    rangeList = _rangeList = newList
    originAttrList = Frame_getOriginAttrList()
    let Frame_render = (direction, callback) => {
        if (prohibition) return
        prohibition = 1
        if (freezen) {
            if ((-1) ** direction == state) return
            state = (-1) ** direction
        }
        start = performance.now()
        rangeList = direction == 1 ? rangeList.map((i) => { return [i[0] * (-1), i[1]] }) : _rangeList
        originAttrList = _originAttrList.length == 0 ? originAttrList : _originAttrList
        requestAnimationFrame(function animate(NowTime) {
            attrList.forEach((each, index) => {
                let timing = timingList[index]
                let rangeAndUnit = rangeList[index]
                percent = (NowTime - start) / duration
                percent = percent > 1 ? 1 : percent
                movingCurve = timing ? timing(percent) : percent
                if (typeof originAttrList[index] == 'string' && originAttrList[index].match(/matrix/)) {
                    if (originAttrList[index].match(/rotate/)) {
                        let angle = Frame_sinCosToAngle(originAttrList[index])
                            + rangeAndUnit[0] * movingCurve + rangeAndUnit[1]
                        let sin = Frame_angleToSinCos(angle)[0]
                        let cos = Frame_angleToSinCos(angle)[1]
                        style.transform = `matrix(${cos}, ${sin}, ${-1 * sin}, ${cos}, 0, 0)`
                    } else if (originAttrList[index].match(/scale/)) {
                        let originScale = Frame_matrixToScale(originAttrList[index])
                        if (direction == 1) {
                            var scale = originScale + (rangeAndUnit[0] + 1) * movingCurve + rangeAndUnit[1]
                        } else {
                            var scale = originScale + (rangeAndUnit[0] - 1) * movingCurve + rangeAndUnit[1]
                        }
                        this.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`
                    }
                }
                else {
                    this.style[each] = originAttrList[index] + rangeAndUnit[0] * movingCurve + rangeAndUnit[1]
                }
            })
            if (percent < 1) {
                if (stopAnimation) return
                requestAnimationFrame(animate.bind(this))
            } else {
                prohibition = 0
                _originAttrList = Frame_getOriginAttrList()
            }
            if (callback instanceof Function) callback(percent)
        }.bind(this))
    }
    let Frame_Delay = function (delay, direction, callback) {
        return function () {
            setTimeout(() => {
                Frame_render(direction, callback)
            }, delay)
        }.bind(this)
    }
    let Frame_delayOrCallback = function (direction, args) {
        if (args.length == 0) return Frame_render.bind(this, direction)
        if (args.length == 1 && typeof args[0] == 'number') return Frame_Delay(args[0], direction)
        if (args.length == 1 && args[0] instanceof Function) return Frame_render.bind(this, direction, args[0])
        return Frame_Delay(args[1], direction, args[0])
    }
    this.StartAnimation = function (...args) {
        return Frame_delayOrCallback(2, args)
    }
    this.TurnBack = function (...args) {
        freezen = false
        return Frame_delayOrCallback(1, args)
    }
    this.Loop = function (percent, backDelay, startDelay) {
        if (percent >= 1) this.TurnBack((percent) => {
            if (percent >= 1) this.StartAnimation((percent) => {
                this.Loop(percent, backDelay, startDelay)
            }, startDelay)()
        }, backDelay)()
    }
    this.Stop = function () {
        return () => { stopAnimation = 1 }
    }
    this.Destroy = function () {
        start = 0
        movingCurve = 0
        percent = 0
        state = -1
        prohibition = 0
        stopAnimation = 0
        attrList = []
        rangeList = []
        _rangeList = []
        timingList = []
        originAttrList = []
        _originAttrList = []
        animations = []
        duration = 0
        freezen = false
        Frame_getOriginAttrList = null
        Frame_sinCosToAngle = null
        Frame_angleToSinCos = null
        Frame_matrixToScale = null
        Frame_getRangeAndUnit = null
        Frame_render = null
        Frame_Delay = null
        Frame_delayOrCallback = null
    }
    return this
}

/*Useage*/

// d1.onclick = d1.FrameAnimation({ //??????=>??????transform:rotate(30deg)????????????????????????{'rotate': 30}?????????,left????????????????????????"%",transform??????
//     animation: [                 //????????????????????????{??????rotate???scale??????????????????}=>??????,?????????????????????
//         { 'rotate': 360, timing: (p) => { return p } }, //????????????????????????,timing=>??????????????????????????????{??????p**2},??????p??????????????????{0~1??????}
//         { 'left': '300px', timing: (p) => { return Math.sqrt(p) } },
//         { 'scale': '1.5', timing: (p) => { return Math.sqrt(p) } },
//     ],
//     duration: 2500,//??????
//     freezen: true,// ??????????????????????????????????????????????????????????????????{?????????????????????},??????turnBack????????????
// }).StartAnimation((p) => { //startAnimation?????????????????????????????????????????????{??????x???????????????}????????????,??????p????????????????????????{0~1??????}
//     d1.Loop(p, 1000, 1000) //loop??????????????????????????????,??????{p,1000,1000}=>{?????????,??????1s????????????,??????????????????1s??????????????????,???????????????}
//     if (p >= 1) d1.TurnBack()() //if (p >= 1) TurnBack()?????????????????????????????????????????????,????????????????????????????????????????????????
// }, 3000) //3000=>????????????,????????????????????????,???????????????????????????,???????????????????????????
// button.onclick = d1.Stop() //????????????
// button.Destroy() //???????????????????????????????????????????????????????????????????????????????????????????????????,??????????????????

HTMLElement.prototype.FrameRippleEffect = function (option) {
    let color = option.color
    let range = option.range
    let duration = option.duration
    let timing = option.timing
    let Frame_render = (e) => {
        let cir = document.createElement('div')
        cir.style['background-color'] = color
        cir.style['border-radius'] = '50%'
        cir.style['position'] = 'absolute'
        cir.style['width'] = '1px'
        cir.style['height'] = '1px'
        cir.style['left'] = e.clientX - this.getBoundingClientRect().left + 'px'
        cir.style['top'] = e.clientY - this.getBoundingClientRect().top + 'px'
        this.appendChild(cir)
        cir.FrameAnimation({
            animation: [
                { 'scale': range, timing },
                { 'opacity': '-1', timing }
            ],
            duration,
        }).StartAnimation((p) => { if (p >= 1) this.removeChild(cir) })()
    }
    this.addEventListener('mousedown', Frame_render)
    this.addEventListener('mouseup', () => {
        removeEventListener('mousedown', Frame_render)
    })
    this.style.overflow = 'hidden'
    return this
}

/*Useage*/

// btn.FrameRippleEffect({
//     color: 'rgb(255, 255, 255, 0.7)',//????????????
//     range: '250', //????????????
//     duration: 800, //???????????? //????????????????????????????????????
//     timing: (p) => { return Math.sqrt(p) } //????????????
// })



export let {
    FrameAnimation,
    FrameRippleEffect 
} = HTMLElement.prototype

export default FrameAnimation 