import {observe} from './Frame.js'
var data = {
    array: [
        { a: 'a1' },
        { a: 'a2' },
        { a: 'a3' }
    ],
    src: '../wedd',
    value: '还行吧也就一个简简单单的框架',
    demo:{
        p:{
            test:123
        }
    }
}
data = observe(data)

var tree = {
    div_box: {
        h1__demo: 'Demo',
        div__text: {
            for: 'ar in array',
            src: '<src>',
            h3: 'h3的值是<ar.a>!!!',
            li__dispaly: {
                text:'li->娃节点',
                p: {
                    text:'p==<demo.p.test>!',
                    src:'<src>'
                }
            }
        },
        input: '<value>',
        button: {
            text: '点击',
            on: 'click <click>'
        },
        p: '<value>'
    }
}

var method = {
    click
}

function click() {
    data.p.test = '改了'
}

export default {
    data,
    tree,
    method
}






