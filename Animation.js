HTMLElement.prototype.FrameAnimation = function (option) {
    let start = 0
    let movingCurve = 0
    let percent = 0
    let origin = 0
    let _this = this
    let prohibition = -1
    let haveStart = -1
    let state = -1
    let range = Number(option.range.match(/\d+/)[0])
    let unit = option.range.match(/[^\d]+/)[0]
    this.startAnimation = function (args) {
        if (args.delay) return Delay(args.delay, args.timing, 2, args.callback)
        return render.bind(null, args.timing, 2, args.callback)
    }
    this.turnBack = function (args) {
        if (args.delay) return Delay(args.delay, args.timing, 1, args.callback)
        return render.bind(null, args.timing, 1, args.callback)
    }
    let Delay = function (delay, timing, direction) {
        return function () {
            setTimeout(() => {
                render.call(null, timing, direction)
            }, delay)
        }
    }
    let render = function (timing, direction, callback) {
        if (prohibition ** (direction) == state) return
        if (!(haveStart ** direction == 1)) return
        state = (-1) ** direction
        haveStart = (-1) ** direction
        start = performance.now()
        origin = parseInt(getComputedStyle(_this).getPropertyValue(option.attribute))
        if (unit == '%') origin = parseInt(getComputedStyle(_this)
            .getPropertyValue(option.attribute)) / option.parentsRange
        requestAnimationFrame(function animate(NowTime) {
            percent = (NowTime - start) / option.duration
            percent = percent > 1 ? 1 : percent
            movingCurve = timing ? timing(percent) : percent
            _this.style[option.attribute] = origin + range * movingCurve * (-1) ** direction + unit
            if (percent < 1) { requestAnimationFrame(animate) }
            _this.animationPercent = percent
            if (callback) callback(percent)
        })
    }
    return this
}

let div1 = document.querySelector('.app')
let div2 = document.querySelector('.app2')
let div3 = document.querySelector('.father')


div3.addEventListener('mouseenter', (e) => {
    if (e.target.className.match(/app/)) {
        e.target.FrameAnimation({
            attribute: 'width',
            range: '300px',
            duration: 1000,
        }).startAnimation({
            timing: (percent) => {
                return percent ** (1 - percent)
            },
            callback: (p) => {
                if (p == 1) {
                    e.target.turnBack({
                        timing: (percent) => {
                            return percent ** (1 - percent)
                        },
                        delay: 1500
                    })()
                }
            }
        })()
    }
}, true)







