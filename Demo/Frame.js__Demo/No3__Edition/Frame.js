class ParsetemplateToRoot {
    constructor(template) {
        let array = this.breaktemplateByLine(template)
        let root = this.findParent(this.allotDiscriptionToTagObj(array))
        return root
    }
    breaktemplateByLine(template) {
        let arr = []
        template = template.split('\n')
        for (let i in template) {
            if (!template[i].match(/[^\s*]/)) continue
            let tabNum = template[i].match(/\s*/)[0].length
            let pretabNum = i == 0 ? null : template[i - 1].match(/\s*/)[0].length
            let tag = template[i].match(/\b\w+(?=\s)/)[0]
            let reg = RegExp('(?<=' + tag + ').+')
            let discription = template[i].match(reg) ? template[i].match(reg)[0] : ''
            let obj = { tag, tabNum, pretabNum, discription, children: [] }
            arr.push(obj)
        }
        return arr
    }
    getOrtiginnAttribute(discription) {
        let res = {}
        if (discription.match(/(?<=\s+\.).+\s+/)) res.class = discription.match(/(?<=\s+\.).+\b\s+/)[0].trim()
        if (discription.match(/(?<=\s+#).+\s+/)) res.id = discription.match(/(?<=\s+#)[^\s]+(?=\s+)/)[0].trim()
        if (discription.match(/(?<=@)[^\s]+(?=\s+|\b)/)) res.on = discription.match(/(?<=@)[^\s]+(?=\s+|\b)/)[0].trim()
        if (discription.match(/(?<=\*)[^\s]+(?=\s+|\b)/)) res.for = discription.match(/(?<=\*)[^\s]+(?=\s+|\b)/)[0].trim()
        if (discription.match(/(?<=\s+){{.+}}/)) res.text = discription.match(/(?<=[\s+]{{)[^{}]+}}/)[0].match(/[^(}})]+/).join('').trim()
        if (discription.match(/(?<=\s*)\w+{{.+(?=}})/)) res[discription.match(/(?<=\s*)\w+(?={{|<)/)] = discription.match(/(?<=\w+({{))[^{}]+}}/)[0].match(/[^(}})]+/).join('').trim()
        return res
    }
    allotDiscriptionToTagObj(arr) {
        for (let i of arr) {
            let newObj = this.getOrtiginnAttribute(i.discription)
            for (let j in newObj) {
                i[j] = newObj[j]
            }
            delete i['discription']
        }
        return arr
    }
    findParent(arr) {
        let root = [arr[0]]
        for (let i = 1; i < arr.length; i++) {
            if (arr[i].tabNum > arr[i].pretabNum) {
                arr[i - 1].children.push(arr[i])
            } else {
                for (let j = i - 1; j >= 0; j--) {
                    if (arr[j].tabNum < arr[i].tabNum) {
                        arr[j].children.push(arr[i])
                        break
                    } else {
                        if (arr[i].tabNum == 0) {
                            root.push(arr[i])
                            break
                        } else {
                            continue
                        }
                    }
                }
            }
        }
        return root
    }
}

class FrameRegExp {
    constructor() { }
    static getArrowBracket(str) {//??????<>?????????????????????<>?????????
        if (str.constructor !== ''.constructor) return [0, null]
        if (!str.match(/(?<=<<).+(?=>>)/) && str.match(/(?<=<).+(?=>)/)) {
            return [str.match(/(?<=<).+(?=>)/).join(''), str.match(/<.+>/).join('')]
        } else return [str, null]
    }
    static getForsItem(str, item) {//??????item.a???item???a
        let reg = RegExp('(?<=\s*)' + item + '(?=\.)')
        if (str.match(reg)) return [str.match(reg)[0], str.match(/(?<=\.)\w+|\d+/)[0]]
    }
    static arrow(str) {//item=>array????????????????????????????????????
        var left = str.match(/(?<=\s*).+(?=\=)/)[0]
        var right = str.match(/(?<=>).+(?=\s*)/)[0]
        return [left, right]
    }
    static removeSpace(str) {
        return str.match(/[^\s]/g).join('')
    }
    static replaceStrToNumber(str) {
        if (str.match(/\['\d+'\]/)) {
            return str.replace(str.match(/\['\d+'\]/), `[${str.match(/\['\d+'\]/)[0].match(/\d+/)[0]}]`)
        } return str
    }
}


export default class Frame {
    constructor(option) {
        this.template = option.template
        this.data = option.data || {}
        this.prop = option.prop || {}
        this.component = option.component || {}
        this.method = option.method || {}
        this._data = this.data
        this.store = {}
        this.forStore = {}
        this.propStore = {}
        this.componentStore = []
        this.data = this.observe(this.data)
        this.root = new ParsetemplateToRoot(this.template)
    }
    observe(data) {
        for (let i in data) {
            if (data[i].constructor == {}.constructor ||
                data[i].constructor == [].constructor) {
                data[i] = this.observe(data[i])
            }
        }
        return new Proxy(data, {
            set: function (target, key, val, recv) {
                let _val = val
                let res = this.findChain(this._data, key, target[key])
                if (val.constructor == {}.constructor ||
                    val.constructor == [].constructor) {
                    val = this.observe(val)
                }
                Reflect.set(target, key, val, recv)
                let result = this.findRecord(res, _val)
                if (!result) {
                    if (Object.keys(this.component).length !== 0) this.findRecordProp(res)
                    this.findRecordFor(res, _val)
                }
                this.updateData()
                return true
            }.bind(this)
        })
    }
    findChain(data, key, val, parentKey) {
        if ((data.constructor !== {}.constructor &&
            data.constructor !== [].constructor)) return
        for (var i in data) {
            if (i == key && data[i] == val) {
                return `['${i}']`
            } else {
                let res = this.findChain(data[i], key, val, i)
                if (res === undefined) {
                    continue
                } else {
                    return `['${i}']${res}`
                }
            }
        }
    }
    updateData() {
        this._data = this.data
    }
    traverseCreate(arr, parent, arrayObj) {//arrayObj ={forsArray,forsItem,realArray,item}
        for (let tagObj of arr) {//this arr is root array
            if (tagObj.for) {
                let forStatement = tagObj.for
                let forsArrayName = FrameRegExp.arrow(forStatement)[1]
                let forsItem = FrameRegExp.arrow(forStatement)[0]
                let realArray = this.allotFromData(forsArrayName)[0]
                for (var index = 0; index < realArray.length; index++) {
                    let arrayObj = { forsArrayName, forsItem, realArray, index }
                    let el = this.createAndAddValue(tagObj, arrayObj)
                    this.recordFor(this.transfer(forsArrayName), { el, tagObj, parent })
                    parent.appendChild(el)
                    if (tagObj.children.length !== 0) {
                        this.traverseCreate(tagObj.children, el, arrayObj)
                    } else {
                        continue
                    }
                }
            } else {
                let el = this.createAndAddValue(tagObj, arrayObj)
                parent.appendChild(el)
                if (tagObj.children.length !== 0) {
                    this.traverseCreate(tagObj.children, el, arrayObj)
                } else {
                    continue
                }
            }
        }
    }
    createAndAddValue(tagObj, arrayObj) {
        let el = document.createElement(tagObj['tag'])
        for (let prop in tagObj) {
            if (['for', 'tag', 'children', 'tabNum', 'pretabNum'].includes(prop)) continue
            let toAdd = tagObj[prop]
            if (FrameRegExp.getArrowBracket(tagObj[prop])[1]) {//??????<>??????
                let contain = FrameRegExp.getArrowBracket(tagObj[prop])[0]//abc
                let origin = FrameRegExp.getArrowBracket(tagObj[prop])[1]//<abc>
                toAdd = this.ifHaveForsItem(contain, arrayObj, { el, prop, origin, textNode: tagObj[prop] })
                if (toAdd.prop && toAdd.prop.constructor == [].constructor) {
                    this.componentStore.find((i) => { return i.el == el }).propValue = toAdd
                } else {
                    toAdd = tagObj[prop].replace(origin, toAdd)
                }
            }
            if (prop == 'on') {
                let onStatement = tagObj.on
                let functionName = FrameRegExp.arrow(onStatement)[1]
                let Event = FrameRegExp.arrow(onStatement)[0]
                if (Event == 'component') {
                    let Component = this.allotFromComponent(functionName)[0]
                    let tempObj = { el, component: Component }
                    this.componentStore.push(tempObj)
                } else {
                    let Function = this.allotFromMethod(functionName)[0]
                    el.addEventListener(Event, Function.bind(this))
                }
            }
            this.addValueToElement(el, prop, toAdd)
        }
        return el
    }
    addValueToElement(el, prop, toAdd) {
        this.ifHaveIf(el, prop, toAdd)
        if (prop == 'text') {
            if (el.tagName == 'INPUT') {
                el.value = toAdd

            } else {
                el.innerText = toAdd
            }
        } else {
            el.setAttribute(prop, toAdd)
            el.removeAttribute('on')
        }
    }
    ifHaveForsItem(contain, arrayObj, elPropObj) {
        let result, toAdd, chain
        if (arrayObj) {
            let itemName = RegExp('(?=\s*)' + arrayObj.forsItem + '\.')
            if (contain.match(itemName)) {
                result = this.allotFromArray(contain.match(/(?<=\.).+(?=\s*)/)[0], arrayObj)
                toAdd = result[0]
                chain = result[1]
                if (elPropObj.prop == 'prop') {
                    toAdd = { prop: [chain, toAdd] }
                    this.recordProp(chain, elPropObj.el)
                } else {
                    this.record(chain, elPropObj)

                }
                return toAdd
            }
        }
        result = this.allotFromData(contain)
        toAdd = result[0]
        chain = result[1]
        if (elPropObj.prop == 'prop') {
            toAdd = { prop: [chain, toAdd] }
            this.recordProp(chain, elPropObj.el)
        } else {
            this.record(chain, elPropObj)
        }
        return toAdd
    }
    mount(parent) {
        let frag = document.createDocumentFragment()
        this.traverseCreate(this.root, frag)
        this.componentMount()
        parent.parentNode.insertBefore(frag, parent)
        parent.parentNode.removeChild(parent)
    }
    deliverProp(each, toAdd) {
        let chain = toAdd.prop[0].match(/(?<=\[').+(?='\])/)[0].trim()
        let data = each.component.data
        data[chain] = this.deepClone(toAdd.prop[1])
    }
    componentMount() {
        if (this.componentStore.length > 0) {
            this.componentStore.forEach((each) => {
                if (each.propValue) this.deliverProp(each, each.propValue)
                each.component.mount(each.el)
            })
        }
    }
    record(chain, elPropObj) {
        if (this.store[chain]) {
            this.store[chain].push(elPropObj)
        } else {
            this.store[chain] = [elPropObj]
        }
    }
    recordProp(chain, el) {
        if (this.propStore[chain]) {
            this.propStore[chain].push(el)
        } else {
            this.propStore[chain] = [el]
        }
    }
    recordFor(chain, obj) {
        if (this.forStore[chain]) {
            for (let each of this.forStore[chain]) {
                if (each.el == obj.el) {
                    return
                }
            }
            this.forStore[chain].push(obj)
        } else {
            this.forStore[chain] = [obj]
        }
    }
    findRecord(chain, value) {
        if (chain) chain = FrameRegExp.replaceStrToNumber(chain)
        value = typeof value == 'number' ? parseFloat(value) : value
        let array = this.store[chain]
        if (array) {
            array.forEach((each) => {
                let newValue = each.textNode.replace(each.origin, value)
                this.addValueToElement(each.el, each.prop, newValue)
            })
            return true
        }
        return false
    }
    findRecordProp(chain) {
        if (chain) {
            chain = FrameRegExp.replaceStrToNumber(chain)
            let _chain = "['" + chain.match(/\[.+\]/)[0].match(/[^\[''\]]+/)[0] + "']"
            let array = this.propStore[_chain]
            if (array) {
                array.forEach((each) => {
                    let component = this.componentStore.find((i) => { return i.el == each })
                    let data = component.component.data
                    eval(`data${chain} = this.data${chain}`)
                })
            }
        }
    }
    findRecordFor(chain, value) {
        if (chain) chain = FrameRegExp.replaceStrToNumber(chain)
        let array = this.forStore[chain]
        value = typeof value == 'number' ? Number(value) : value
        let nextSibling = null
        if (array) {
            for (let i = 0; i < array.length; i++) {
                if (i == array.length - 1) {
                    nextSibling = array[i].el.nextElementSibling
                }
                array[i].el.remove()
            }
            let frag = document.createDocumentFragment()
            this.traverseCreate([array[0].tagObj], frag)
            if (!nextSibling) {
                array[0].parent.appendChild(frag)
            }
            array[0].parent.insertBefore(frag, nextSibling)
            return true
        }
        return false
    }
    ifHaveIf(el, prop, toAdd) {
        if (prop == 'if') {
            if (![undefined, 1, 'true', true, '1'].includes(toAdd)) {
                el.remove()
            } else {
                if (!el) {

                }
            }
        }
    }
    deepClone(originObj) {
        if (typeof originObj !== 'object') return originObj
        let obj = Array.isArray(originObj) ? [] : {}
        for (let i in originObj) {
            if (typeof originObj[i] === 'object') {
                obj[i] = this.deepClone(originObj[i])
            } else if (typeof originObj[i] === 'function') {
                obj[i] = originObj[i].bind(obj)
            } else {
                obj[i] = originObj[i]
            }
        }
        return obj
    }
    transfer(contain) {
        var array = []
        contain = contain.split('.')
        contain.forEach((i) => {
            array.push(`['${i}']`)
        })
        return array.join('')
    }
    allotFromData(contain) {
        return [eval(`this.data${this.transfer(contain)}`), `${this.transfer(contain)}`]
    }
    allotFromMethod(contain) {
        return [eval(`this.method${this.transfer(contain)}`), `${this.transfer(contain)}`]
    }
    allotFromComponent(contain) {
        return [eval(`this.component${this.transfer(contain)}`), `${this.transfer(contain)}`]
    }
    allotFromArray(contain, arrayObj) {
        let implement = `${this.transfer(arrayObj.forsArrayName)}[${arrayObj.index}]`
        return [eval(`this.data${implement}${this.transfer(contain)}`), `${implement}${this.transfer(contain)}`]
    }
}









