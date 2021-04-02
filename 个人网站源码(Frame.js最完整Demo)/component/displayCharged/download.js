const template = `
    div .download 
        div .tip                              
            span {{<Tip>}}
        div .contain 
            a .file href{{<file.href>}} *file=>files download{{<file.name>}} 
                img src{{<file.iconSrc>}} .srcosihjvoid 
                span .fileName {{<file.name>}} 
    `

export default {
    template,
    data() {
        return {
            Tip:'直接点击图标即可下载>>>Frame.zip文件内包含了Frame.js、Animation.js、Drag.js, 也可单独下载单个文件',
            files:[
                {name:'Frame.zip',iconSrc:'../../static\/svg\/Zip.svg',href:'../../static\/Frame\/Frame.zip'},
                {name:'Frame.js',iconSrc:'../../static\/svg\/js.svg',href:'../../static\/Frame\/Frame.js'},
                {name:'Animation.js',iconSrc:'../../static\/svg\/js.svg',href:'../../static\/Frame\/Animation.js'},
                {name:'Drag.js',iconSrc:'../../static\/svg\/js.svg',href:'../../static\/Frame\/Drag.js'},
            ],
        }
    },
    style: {
        '.download': `
            position: absolute;
            width: calc(100%);
            min-height: 655px;`
            ,
        '.tip':`
            width: calc(100% - 40px);
            background-color: #fff;
            border-radius: 18px;
            padding: 17px 20px;
            font-weight: 100;
            font-size: 18px;
            display: flex;
            justify-content: center;
            align-items: center;`
            ,
        '.contain':`
            width: calc(100% - 40px);
            background-color: #fff;
            min-height:545px;
            border-radius: 18px;
            margin-top: 20px;
            padding: 27px 20px;
            display:flex;`
            ,
        'a':`
            width:128px;
            height:128px;
            display:block;
            margin-right:20px;
            color:gray;
            display:flex;
            flex-direction:column;
            align-items:center;
            cursor:pointer;`
    }
}