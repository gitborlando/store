import Frame from "../../Frame.js"
import sonComp from './sonComp.js'
import daughterComp from './daughterComp.js'

const template = `
div .comp2 style{{background-color:skyBlue;padding:15px;width:550px;margin:auto;display:flex;flex-direction:column}}  
    h1 {{Start! With Your Frame App}}
    h2 {{这是第father组件}} 
    div 
        input type{{text}} {{<value>}} @input=>input .input1  
        button {{点一下，son组件的JavaScript就会变成Node.js}} @click=>click 
    p {{<value>}} 
    sonComp @component=>sonComp prop{{<sonProp>}} 
    daughterComp @component=>daughterComp 
    h2 {{End}}
`
export default new Frame({
    template,
    data: {
        value: '打几个字康康会有啥神奇的事发生',
        sonProp: {
            array: [
                { item1: 'JavaScript' },
                { item1: 'Html' },
                { item1: 'Css' }
            ]
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
            this.data.value = input.value
        }
    }
})