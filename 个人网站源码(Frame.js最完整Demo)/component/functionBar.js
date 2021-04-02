import addColor from '../util/util.js'

const template = `
    div .functionBar 
        div .box @click=>clickEvents  
            div .functionBarCharged *eachI=>list 
                a href{{<eachI.path>}} 
                    i {{<eachI.icon>}} style{{color:<eachI.color>}} 
        span   
`

export default {
    template,
    data() {
        return {
            list: [//
                { path: '#', name: 'codingTime', icon: '&#xe61a;', color: addColor() },
                { path: '#showTheCode', name: 'showTheCode', icon: '&#xe6b0;', color: addColor() },
                { path: '#download', name: 'uploadFile', icon: '&#xe61d;', color: addColor() }
            ]
        }
    },
    method: {
        clickEvents(e) {
            var index = 0
            let tar = e.target
            let childs = [...this.curent.childNodes]
            if (['I', 'A'].includes(tar.tagName)) {
                if (tar.tagName === 'A') {
                    index = childs.indexOf(tar.parentNode)
                } else {
                    index = childs.indexOf(tar.parentNode.parentNode)
                }
                let sapn = this.curent.nextSibling
                let curentIndex = (sapn.offsetLeft - 27) / 100
                if (index === curentIndex) {
                }else {
                    sapn.FrameAnimation({
                        animation: [
                            { 'left': `${(index - curentIndex) * 100}px`, timing: (p) => { return Math.sqrt(p) } }
                        ],
                        duration: 200
                    }).StartAnimation((p) => {
                        if (p >= 1) sapn.Destroy()
                    })()
                }
            }
        }
    },
    style: {
        span: `
            width:46px;
            height:4px;
            position:relative;
            left:27px;
            background-color: ${addColor()}`
        ,
        '.box': `
            width:100%;
            height:70px;
            display:flex;`
        ,
        a: `
            text-decoration: none;`
    }
}