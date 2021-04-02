const template = `
    div 
        pre  *eachCode=>codeList 
            code {{<eachCode.code>}}
`


export default {
    template,
    data() {
        return {
            codeList: [
                { code: '' }
            ]
        }
    },
    style: {

    }
}