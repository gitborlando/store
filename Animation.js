HTMLElement.prototype.FrameAnimation = function (option) {
    let start = 0
    let movingCurve = 0
    let percent = 0
    let _this = this
    let state = -1
    let attrList = []
    let rangeList = []
    let _rangeList = []
    let timingList = []
    let originAttrList = []
    let _originAttrList = []
    let animations = option.animation
    if (animations.constructor == {}.constructor) animations = [animations]
    animations.forEach((each) => {
        rangeList = [...rangeList, ...Object.values(each).filter((i) => { return !(i instanceof Function) })]
        attrList = [...attrList, ...Object.keys(each).filter((i) => { return rangeList.includes(each[i]) })]
        timingList = [...timingList, ...Object.values(each).filter((i) => { return i instanceof Function })]
    })
    let newList = []
    rangeList.forEach((each) => {
        each = grtRangeAndUnit(each)
        newList.push(each)
    })
    rangeList = _rangeList = newList
    originAttrList = getOriginAttrList()
    this.startAnimation = function (...args) {
        return advanceOrBack(2, args)
    }
    this.turnBack = function (...args) {
        return advanceOrBack(1, args)
    }
    function advanceOrBack(direction, args) {
        if (args.length == 0) return render.bind(null, direction)
        if (args.length == 1 && typeof args[0] == 'number') return Delay(args[0], direction)
        if (args.length == 1 && args[0] instanceof Function) return render.bind(null, direction, args[0])
        return Delay(args[1], direction, args[0])
    }
    function Delay(delay, direction, callback) {
        return function () {
            setTimeout(() => {
                render(direction, callback)
            }, delay)
        }
    }
    function render(direction, callback) {
        if ((-1) ** (direction) == state) return
        state = (-1) ** direction
        start = performance.now()
        rangeList = direction == 1 ? rangeList.map((i) => { return [i[0] * (-1), i[1]] }) : _rangeList
        originAttrList = _originAttrList.length == 0 ? originAttrList : _originAttrList
        requestAnimationFrame(function animate(NowTime) {
            attrList.forEach((each, index) => {
                let timing = timingList[index]
                let rangeAndUnit = rangeList[index]
                percent = (NowTime - start) / option.duration
                percent = percent > 1 ? 1 : percent
                movingCurve = timing ? timing(percent) : percent
                _this.style[each] = originAttrList[index] + rangeAndUnit[0] * movingCurve + rangeAndUnit[1]
            })
            if (percent < 1) { requestAnimationFrame(animate) } else {
                _originAttrList = getOriginAttrList()
            }
            if (callback instanceof Function) callback(percent)
        })
    }
    function getOriginAttrList() {
        let aList = []
        attrList.forEach((each) => {
            let originAttr = parseFloat(getComputedStyle(_this).getPropertyValue(each))
            aList.push(originAttr)
        })
        return aList
    }
    function grtRangeAndUnit(each) {
        let unit = (typeof each == 'string' && each.match(/[^-?\d*\.?\d*]+/)) ? each.match(/[^-?\d*\.?\d*]+/)[0] : 0
        let range = parseFloat(each)
        return [range, unit]
    }
    return this
}

/*Useage*/

let div1 = document.querySelector('.div1')
let div2 = document.querySelector('.div2')

div1.onclick = div1.FrameAnimation({
    animation: [
        { 'left': '-100px' },
        { 'opacity': '0.8', },
    ],
    duration: 500
}).startAnimation((p) => {
    if (p >= 1) { 
        div2.startAnimation(3000)()
    }
})
div2.FrameAnimation({
    animation: [
        { 'left': '100px' }
    ],
    duration: 500
})