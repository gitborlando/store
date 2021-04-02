const template = `
    div .codingTime-display .displayCharged style{{position:absolute}}
        div .fighting 
            span style{{display:flex}} 
                h1 {{<item.letterF>}} style{{color:<item.color>;font-size:105px}} *item=>color 
            span style{{display:flex}} 
                h1 {{<item.letterG>}} style{{color:<item.color>;font-size:90px}} *item=>color 
        div .timeList 
            div style{{display:flex;width:100%;margin:10px 0px 15px 0px;position:relative}}
                button .button @click=>addRecord 
                    h4 {{<addRecord.startADay>}} style{{color:white}}
                h3 {{<allTime.allTime>}} style{{color:<allTime.colour>;position:absolute;left:160px;top:3px}}
            div style{{width:100%;overflow-y: scroll;}}
                li style{{display:flex;width:100%;margin:5px 0px;}} *each=>list
                    div 
                        h3 {{<each.duration>}} style{{color:<each.color>}}  
                        p {{<each.day>}} style{{font-size:15px;color:gray;color:<each.color>}}                  
`
export default {
    template,
    data() {
        return {
            color: [],
            list: [{ day: '', duration: '', color: '' }],
            allTime: { allTime: '', colour: '' },
            addRecord: {
                startADay: '开启新的一天'
            }
        }
    },
    beforeMount: {
        addColorAndLetter() {
            let f = 'Fighting!!!'
            let g = 'Gitborlando'
            let color = [
                '#82D0D5', '#A1E0B8', '#3AADA6', '#EABFE4', '#A5B0E1', '#ACA0DF',
                '#4DABC4', '#A778D2', '#A2E0DA', '#45AFC1'
            ]
            for (let i = 0; i < 11; i++) {
                let obj = {}
                obj.letterF = f[i]
                obj.letterG = g[i]
                obj.color = color[parseInt(Math.random() * 10)]
                this.data.color.push(obj)
            }
        }
    },
    afterMount: {
        buttonRipple(p) {
            [...p.querySelectorAll('.button')].forEach((each) => {
                each.FrameRippleEffect({
                    color: 'rgba(255,255,255,0.3)',
                    range: '250',
                    duration: 1500,
                    timing: (p) => { return Math.sqrt(p) }
                })
            })
        },
        async loadTimeList() {
            let response = await fetch('codingTime')
            let result = (await response.json()).reverse()
            let obj = this.util.allotColorToTimeList(result)
            this.data.allTime.allTime = '总Coding时长: ' + obj.allTime
            this.data.allTime.colour = obj.color
            this.data.list = result
        }
    },
    method: {
        addRecord() {
            if (this.data.addRecord.startADay == '开启新的一天') {
                this.start = this.util.time()
                this.data.addRecord.startADay = '小潘正在Fighting中'
            } else if (this.data.addRecord.startADay == '小潘正在Fighting中') {
                let over = this.util.time()
                this.data.addRecord.startADay = '今天任务结束'
                this.util.check(this.start, over)
            } else {
                return
            }
        }
    },
    util: {
        async check(start, over) {
            let formData = new FormData()
            formData.append('day', this.util.date())
            let response = await fetch('codingTime/check', {
                method: 'POST',
                body: formData
            })
            let result = await response.json()
            result = result[0].origin
            if (result == 'not found') {
                this.util.add(start, over)
            } else {
                this.util.merge(parseInt(result), start, over)
            }
        },
        async add(start, over) {
            var data = {
                day: this.util.date(),
                duration: this.util.toHour(start, over),
                origin: (over - start).toString()
            }
            let response = await fetch('codingTime/send', {
                method: 'POST',
                body: this.util.addToFormData(data)
            })
            let result = await response.text()
            if (result == 'ok') {
                this.data.list.push({
                    day: data.day,
                    duration: data.duration,
                    color: this.util.addColor()
                })
            } else {
                alert('服务器走丢了')
            }
        },
        async merge(preduration, start, over) {
            var data = {
                day: this.util.date(),
                duration: this.util.toHour(0, preduration + over - start),
                origin: (preduration + over - start).toString()
            }
            let response = await fetch('codingTime/update', {
                method: 'POST',
                body: this.util.addToFormData(data)
            })
            let result = await response.json()
            if (result) {
                this.data.list[0] = {
                    day: data.day,
                    duration: data.duration,
                    color: this.util.addColor()
                }
                let obj = this.util.allotColorToTimeList(result.reverse())
                this.data.allTime.allTime = '总Coding时长: ' + obj.allTime
                this.data.allTime.colour = obj.color
                this.data.list = result
            } else {
                alert('服务器走丢了')
            }
        },
        addToFormData(data) {
            let formData = new FormData()
            Object.keys(data).forEach((i) => {
                formData.append(i, data[i])
            })
            return formData
        },
        allToHour(all) {
            all = all / 1000 / 60
            var hour = this.util.tofix((all / 60))
            var minute = this.util.tofix(all % 60)
            return `${hour}小时${minute}分钟`
        },
        toHour(start, over) {
            var duration = over - start
            duration = duration / 1000 / 60
            var hour = this.util.tofix((duration / 60))
            var minute = this.util.tofix(duration % 60)
            return `${hour}小时${minute}分钟`
        },
        tofix(time) {
            return Math.floor(time)
        },
        time() {
            return Number(new Date())
        },
        date() {
            return `${new Date().getMonth() + 1}月${new Date().getDate()}日`
        },
        allotColorToTimeList(list) {
            let color = [
                '#82D0D5', '#A1E0B8', '#3AADA6', '#EABFE4', '#A5B0E1', '#ACA0DF',
                '#4DABC4', '#A778D2', '#A2E0DA', '#45AFC1'
            ]
            let allTimeLong = 0
            for (let each of list) {
                each.color = color[parseInt(Math.random() * 10)]
                allTimeLong += parseInt(each.origin)
            }
            return { allTime: this.util.allToHour(allTimeLong), color: color[parseInt(Math.random() * 10)] }
        },
        addColor() {
            return [
                '#82D0D5', '#A1E0B8', '#3AADA6', '#EABFE4', '#A5B0E1', '#ACA0DF',
                '#4DABC4', '#A778D2', '#A2E0DA', '#45AFC1'
            ][parseInt(Math.random() * 10)]
        }
    },
    style: {
        '.button': `
        background-image: linear-gradient(45deg, #a1c4fd 0%, #c2e9fb 100%);
        border:none;
        outline:none;
        padding:7px 10px;
        border-radius:5px;
        position: relative;`
        ,
    }
}