let template = `
h2 {{Frame.js is an excellent framework!}}
div 
    p {{<bind>}}
    input #input {{<bind>}} type{{range}} @input=>input
    button {{+10}} @click=>add
div .<class> 
    h2 {{列表项}}
    ul 
        li *item=>array
            div .contain
                p {{<item.text>}}
    button {{变成两项}} @click=>click            
    div .footer
        h2 {{Footer部分}}
        a href{{http://gitborlando.cn}} {{gitborlando.cn}} 
`

let data = {
    array: [
        { text: '这是第一句话' },
        { text: '这是第二句话' },
        { text: '这是第三句话' }
    ],
    class: 'ddd',
    bind: 30
}

let method = {
    click: function () {
        this.data.array = [
            { text: '这是第一句话' },
            { text: '这是第二句话' }
        ]
    },
    add: function () {
        this.data.bind += 10
    },
    input: function () {
        let value = document.querySelector('#input').value
        this.data.bind = Number(value)
    }
}

import Frame from "./Frame.js";

export default new Frame({
    template,
    data,
    method
})
