import functionBar from './functionBar.js'
import display from './display.js'

const template = `
    div .outer style{{margin:auto}} 
        span style{{display:flex}} 
            h1 .h1 {{<each.letter>}} style{{color:<each.color>}} *each=>hWord 
        functionBar @component=>functionBar 
        display @component=>display 
`

export default {
    template,
    data:{
        hWord:[]
    },
    beforeMount:{
        h(){
            let g = 'Gitborlando.cn'
            for(let i of g){
                let obj = {}
                obj.letter = i
                obj.color = '#ACA0DF'//'#A778D2'//this.util.addColor()
                this.data.hWord.push(obj)
            }
        },
        // hljs(){
        //     try {
        //         if(hljs){
        //             alert('cunzai')
        //         }
        //     } catch (error) {
        //         throw new Error('bucunzai')
        //     }

        // }
    },
    component:{
        functionBar,
        display
    },
    style:{
        span:`
        border-bottom:2px solid #ACA0DF;
        margin-bottom:20px;
        padding-bottom: 5px;`//text-shadow: 1px 1px rgb(170, 182, 182);
    }
}