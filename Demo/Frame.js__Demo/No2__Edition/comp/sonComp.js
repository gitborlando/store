import Frame from "../../Frame.js"

const template = `
div .sonComp  style{{background-color:pink;}} 
    h2 {{这是第Son组件}} 
    input type{{text}} {{<value>}} @input=>input .input2  
    button {{这个按钮也点一下}} @click=>click 
    p {{<value>}} 
    div *item=>sonProp.array 
        li {{<item.item1>}} 
    h2 {{End}}
`
export default new Frame({
    template,
    data: {
        value: 'son组件也打几个字康康',
        sonProp: ''
    },
    method: {
        click: function () {
            this.data.value = '看到没，数据绑定成功啦'
        },
        input: function () {
            let input = document.querySelector('.input2')
            this.data.value = input.value
        }
    }
})