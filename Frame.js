const findChainData = function (data, arr) {
    for (let k of Object.keys(data)) {
        if (arr == k) {
            return data[k]
        } else {
            if (data[k].constructor !== {}.constructor || dataect.keys(data[i]).length == 0) {
                continue
            } else {
                return findChainData(data[k], arr)
            }
        }
    }
}

const If = function (i) {
    var yes = [undefined, true, 1]
    var no = [null, false, -1, 0]
    if (yes.includes(i.if)) {
        return false
    } else if (no.includes(i.if)) {
        return true
    } return true
}


const removeSpace = function (node) {
    return node.match(/[^\s]/g).join('')
}

const removeMumber = function (node) {
    if (node.match(/^h\d(?=_)/) || node.match(/^h\d$/)) return node
    return node.match(/[^\d]/g).join('')
}

const isTag = function (root) {
    root = getTag(removeMumber(root))[0]
    var tagNames = {
        a: 1, img: 1, div: 1, p: 1, input: 1, span: 1,
        button: 1, li: 1, ul: 1, h1: 1, h3: 1,
    }
    return tagNames[root] == 1
}

const isForOnIf = function (node) {
    var isframeInstructions = { for: 1, if: 1, on: 1 }
    return isframeInstructions[node] === 1
}

const getTag = function (node) {
    if (node.search('__') > 0) {
        return [node.match(/^\w+(?=__)/).join(''), { id: node.match(/(?<=__)\w+/).join('') }]
    } else if (node.search('_') > 0) {
        return [node.match(/^\w+(?=_)/).join(''), { class: node.match(/(?<=_)\w+/).join('') }]
    }
    return [node, {}]
}

const createElement = function (i, parent) {
    var tag = getTag(removeMumber(i))[0]
    var attribute = getTag(removeMumber(i))[1]
    var el = document.createElement(tag)
    el.addClass(attribute)
    parent.appendChild(el)
    return el
}

HTMLElement.prototype.addClass = function (attribute) {
    if (attribute.class) {
        this.className = (attribute.class)
    } else if (attribute.id) {
        this.setAttribute('id', attribute.id)
    } else {
        return
    }
}

const transfer = function (contain) {
    var array = []
    contain = contain.split('.')
    contain.forEach((i) => {
        array.push(`['${i}']`)
    })
    return array.join('')
}

const allotDataToAdd = function allotDataToValueOfTextNode(node, j, discription, data) {//解析rooti的<>并给rooti插值
    if (node == null || node == undefined || node.constructor !== ''.constructor) return node
    var have = node.match(/(?<=<).+(?=>)/) && !(node.match(/(?<=<<).+(?=>>)/))
    if (have) {
        if (discription) {
            var array = findChainData(data, discription.slice(discription.search(/\s(\w+)$/) + 1, discription.length))//查找数组
            var itemName = discription.match(/\w+/)[0]
        }
        var value
        var contain = node.match(/(?<=<).+(?=>)/)[0] //不带括号
        var result = node.match(/<(.+)>/)[0] //带括号
        var reg = RegExp('^' + itemName + '(?=\.)')
        if (itemName && contain.match(reg)) {
            contain = contain.replace(itemName, 'array[' + j + ']')         
            value = eval(contain)
        } else {
            contain = transfer(contain)
            value = eval('data' + contain)
        }
        return node.replace(result, value)
    }
    return node
}

const allotAddToElement = function (element, i, textNode, j, discription, data) {
    var toAdd = allotDataToAdd(textNode, j, discription, data)
    if (!isTag(i) && i !== 'text') {
        element.setAttribute(i, toAdd)
    } else {
        if (element.tagName == 'INPUT') {
            element.value = toAdd
        } else if (element.tagName == 'IMG') {
            element.src = toAdd
        } else {
            element.innerHTML = toAdd
        }
    }
}

class Record {
    constructor() {
        this.map = new Map()
    }
    record(arr, el,) {
        this.map.set(arr, el)
        return el
    }
    findRecord(res) {
        var reg = RegExp('(?<=<)' + res + '(?=>)')
        for (var i of this.map.keys()) {
            if (i[2].match(reg)) {
                allotAddToElement(i[0], i[1], i[2], i[3], i[4], i[5])
            }
        }
    }
}
var record = new Record()


function findChain(data, key, parentKey) {   //root?array
    if ((data.constructor !== {}.constructor)) return
    for (var i in data) {
        if (i == key) {
            return key
        } else {
            let res = findChain(data[i], key, i)
            if (res === undefined) {
                continue
            } else {
                return i + '.' + res
            }
        }
    }
}
var _data = {}
export const observe = function (data) {
    for (var i in data) {
        if (data[i].constructor == {}.constructor ||
            data[i].constructor == [].constructor) {
            data[i] = observe(data[i])
        }
    }
    return new Proxy(data, {
        set(root, i, val, recv) {
            Reflect.set(root, i, val, recv)
            var res = findChain(_data, i)
            record.findRecord(res)
            return true
        }
    })
}


export const render = function (element, module) {
    let root = module.tree, data = module?.data, method = module?.method
    _data = data                             //检测是否为tag
    let fragment = document.createDocumentFragment()
    findChain(root, fragment)
    element.appendChild(fragment)
    function findChain(root, p, j, discription) { //递归根对象
        if (!(root.constructor == {}.constructor)) return
        for (let i in root) {
            if (isTag(i)) {// 检测是标签
                if (root[i].constructor !== {}.constructor) {//是标签但没有子项
                    var el = createElement(i, p)//生成节点和给节点添加值的过程分开了
                    allotAddToElement(el, i, root[i], j, discription, data)
                    record.record([el, i, root[i], j, discription, data], el)
                } else { //是标签有子项
                    if (If(root[i])) {//检测有无if
                        continue
                    } else if (root[i].for !== undefined) {//检测有无for
                        var discription = root[i].for
                        var array = findChainData(data, discription.slice(discription.search(/\s(\w+)$/) + 1, discription.length))//查找数组
                        for (let j = 0; j < array.length; j++) {
                            var el = createElement(i, p)
                            findChain(root[i], el, j, discription)
                        }
                    } else if (root[i].on !== undefined) {
                        var onWhat = root[i].on
                        var What = removeSpace(onWhat).match(/^\w+(?=<)/).join('')
                        var Function = method[removeSpace(onWhat).match(/(?<=<)\w+(?=>)/).join('')]
                        var el = createElement(i, p)
                        el.addEventListener(What, Function.bind(null, data))
                        findChain(root[i], el)
                    } else {//for if on 都没有
                        var el = createElement(i, p)
                        findChain(root[i], el, j, discription)
                    }
                }
            } else {// 不是标签
                if (isForOnIf(i)) continue
                allotAddToElement(p, i, root[i], j, discription, data)
                record.record([p, i, root[i], j, discription, data], p)
            }
        }
    }
}






// export default class Frame{
//     constructor(){

//     }
//     static render = render
//     static observe = observe
// }






