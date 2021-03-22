import Frame from "../Frame.js"

const template = `
div .daughterComp style{{background-color:pink;padding:0px 10px;margin-top:15px}} 
    h2 {{这是daughter组件}} 
    input type{{text}} {{<value>}} .input3 @input=>input  
    button {{这个按钮也点一下}} @click=>click  
    p {{<value>}} 
    p {{daughter组件收到了：<daughterProp.text>}}
    h2 {{End}} 
`
export default new Frame({
    template,
    data: {
        value: 'daughter组件也打几个字康康',
        daughterProp: ''
    },
    method: {
        click: function () {
            this.data.value = '看到没，数据绑定成功啦'
        },
        input: function () {
            let input = document.querySelector('.input3')
            this.data.value = input.value
        }
    }
})