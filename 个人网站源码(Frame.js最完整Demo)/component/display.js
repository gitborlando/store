import FrameAnimation from '../Frame/Animation.js'
import codingTime from './displayCharged/codingTime.js'
import showTheCode from './displayCharged/showTheCode.js'
import download from './displayCharged/download.js'

const template = `
    div .display style{{position:relative}}
        codingTime @component=>codingTime
        showTheCode @component=>showTheCode
        download @component=>download
`

export default {
    template,
    data: {

    },
    afterMount: {
        abc() {
            let arr = Object.keys(this.component)
            arr.forEach((each) => {
                let o = this.getComponent(each)
                o.style.display = 'none'
                //o.style.left = '-100px'
                o.style.opacity = 0
            })
            let obj = {
                '/': 'codingTime',
                'showTheCode': 'showTheCode',
                'download': 'download', 
            }
            window.addEventListener('load', () => {
                bcd(location.hash)
            })
            window.addEventListener('hashchange', () => {
                bcd(location.hash)
            })
            var bcd = (hash) => {
                hash = hash === '' ? '/' : hash.slice(1)
                if (Object.keys(obj).includes(hash)) {
                    let o = this.getComponent(obj[hash])
                    o.style.display = 'block'
                    this.util.anim(o)
                    arr.filter((each) => {
                        if (each !== obj[hash]) return each
                    }).forEach((each) => {
                        each = this.getComponent(each)
                        each.style.display = 'none'
                        //this.util.animout(each)
                        //each.style.left = '-100px'
                        each.style.opacity = 0
                    })
                }
            }
        }
    },
    component: {//
        codingTime,
        showTheCode,
        download,
    },
    util: {
        anim(el) {
            el.FrameAnimation({
                animation: [
                    //{ left: '100px', timing: (p) => { return Math.sqrt(p) } },
                    { opacity: '1',  }//timing: (p) => { return Math.sqrt(p) }
                ],
                duration: 260
            }).StartAnimation((p) => {
                if (p >= 1) {
                    el.Destroy()
                }
            })()
        },
        animout(el) {
            el.FrameAnimation({
                animation: [
                    { left: '-100px', timing: (p) => { return Math.sqrt(p) } },
                    { opacity: '-1', timing: (p) => { return Math.cbrt(p) } }
                ],
                duration: 300
            }).StartAnimation((p) => {
                if (p >= 1) {
                    el.Destroy()
                }
            })()
        }
    }
}