import Frame from "../Frame.js"
import sonComp from './sonComp.js'
import daughterComp from './daughterComp.js'

const template = `
div .comp2 style{{background-color:skyBlue;padding:15px;width:550px;margin:auto;display:flex;flex-direction:column}}  
    h1 {{Start! With Your Frame App}} style{{margin-bottom:0px}}
    h2 {{这是father组件}} 
    div 
        input type{{text}} {{<parentvalue>}} @input=>input .input1  
        button {{点一下，son组件的JavaScript就会变成Node.js}} @click=>click 
    p {{<parentvalue>}} 
    div 
    	input {{写点什么发送给daughter组件吧}} .input4 
    	button {{发送}} @click=>inputToDaughter 
    br 
    sonComp @component=>sonComp prop{{<sonProp>}} 
    daughterComp @component=>daughterComp prop{{<daughterProp>}} 
    h1 {{End}} style{{margin-bottom:0px}}
`
export default new Frame({
    template,
    data: {
        parentvalue: '打几个字康康会有啥神奇的事发生',
        sonProp: {
            array: [
                { item1: 'JavaScript' },
                { item1: 'Html' },
                { item1: 'Css' }
            ],
            text: '123'
        },
        daughterProp: {
            text:' '
        }
    },
    component: {
        sonComp,
        daughterComp
    },
    method: {
        click: function () {
            this.data.sonProp.array[0].item1 = 'Node.js'
        },
        input: function () {
            let input = document.querySelector('.input1')
            this.data.parentvalue = input.value
        },
        inputToDaughter: function () {
            let input = document.querySelector('.input4')
            this.data.daughterProp.text = input.value
        }
    }
})