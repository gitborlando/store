import article from './article.js'

const template = `
    div .showTheCode  
        div .aside style{{<aside.asideStyle>}} 
            li style{{<aside.liStyle>}} *title=>titles 
                div .title to{{/showCode/articles/<title.name>}} @click=>getArticles 
                    h4 {{<title.name>}} 
        div .article 
            article @component=>article prop{{<codeList>}}
`

// import '../../util/highlight/highlight.pack.js'

export default {
    template,
    data() {
        return {
            titles: [
                { name: '' }
            ],
            aside: {
                asideStyle: '',
                liStyle: '',
                spanStyle: '',
            },
            codeList: [
                { code: '' }
            ]
        }
    },
    beforeMount: {
        abc() {
            this.util.mediaStyle('window.innerWidth <= 700', {
                'aside.asideStyle': ['.aside<700', '.aside'],
                'aside.liStyle': ['.asideLi<700', '.asideLi'],
                'aside.spanStyle': ['.spanStyle<700', '.spanStyle']
            })
        }
    },
    afterMount: {
        async getTitles() {
            let res = await fetch('showCode/titles')
            this.data.titles = await res.json()
            res = await fetch('/showCode/articles/Animation')
            this.data.codeList = await res.json()
            hljs.highlightAll()
        }
    },
    method:{
        async getArticles(){
            let curent = this.curent
            let res = await fetch(curent.getAttribute('to'))
            this.data.codeList = await res.json()
            hljs.highlightAll()
        }
    },
    component: {
        article
    },
    util: {
        mediaStyle(condition, obj) {
            function abc() {
                Object.entries(obj).forEach((each) => {
                    if (eval(condition)) {
                        eval(`this.data.${each[0]}= this.mediaStyle['${each[1][0]}']`)
                    } else {
                        eval(`this.data.${each[0]}= this.mediaStyle['${each[1][1]}']`)
                    }
                })
            }
            window.addEventListener('load', abc.bind(this))
            window.addEventListener('resize', abc.bind(this))
        }
    },
    style: {//display: flex;
        '.showTheCode': `
            position: absolute;
            width: calc(100%);
            min-height: 655px;`
        ,
        '.article': `
            width: calc(70% - 50px);
            min-height: 655px;
            border-radius: 18px;
            background-color: rgb(255, 255, 255);
            padding: 20px 20px;
            overflow: hidden;
            margin-bottom: 37px;
            `,
        h4: `
            margin:10px 7px`
            ,
        '.title':`
            cursor: pointer;`
    },
    mediaStyle: {
        '.aside': `
            width: calc(30% - 40px);
            padding: 7px 15px;
            margin-right:20px;
            border-radius: 18px;
            background-color: rgb(255, 255, 255);
            position: sticky;
            position: -webkit-sticky;
            top: 30px;
            float: left;
            z-index:10`
        ,
        '.aside<700': `
            position: relative;
            z-index:10;
            width:50px;
            height:50px;
            border-radius:5px;
            background-image: linear-gradient(45deg, #a1c4fd 0%, #c2e9fb 100%);
            overflow:hidden;
            margin: 0px 0 10px 0;
            cursor:pointer;
            display:flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;`
        ,
        '.asideLi': `
            list-style-type: none;`
        ,
        '.asideLi<700': `
            display:none;`
        ,
        '.spanStyle<700': `
            display:block;
            width:40px;
            height:3px;
            border-radius: 1.5px;
            background-color:white;`
        ,
        '.spanStyle': `
            display:none;`

    }
}