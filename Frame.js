
const compileModule = function (data, node, j, itemName) {//解析rooti的<>并给rooti插值
    if (node == null || node == undefined || node.constructor !== ''.constructor) return node
    var have = node.match(/(?<=<).+(?=>)/) && !(node.match(/(?<=<<).+(?=>>)/))
    if (have) {
        var value
        var contain = node.match(/(?<=<).+(?=>)/)[0] //不带括号
        var result = node.match(/<(.+)>/)[0] //带括号
        if (result.match(itemName)) {
            contain = contain.replace(itemName, 'array[' + j + ']')
            value = eval(contain)
        } else {
            value = eval('data.' + contain)
        }
        return node.replace(result, value)
    }
    return node

}

const traverseData = function (data, arr) {
    for (let k of Object.keys(data)) {
        if (arr == k) {
            return data[k]
        } else {
            if (data[k].constructor !== {}.constructor || Object.keys(data[i]).length == 0) {
                continue
            } else {
                return traverseData(data[k], arr)
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
    if (node.match(/^h\d(?=_)/)) return node
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

const isFoeOnIf = function (node) {
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


const render = function (element, module) {         //检测for if on
    let root = module.tree, data = module?.data, method = module?.method      //检测是否为tag
    let fragment = document.createDocumentFragment()//检测是否为attr
    traverse(root, fragment)
    element.appendChild(fragment)
    function traverse(root, p, j, itemName) { //递归根对象
        if (!(root.constructor == {}.constructor)) return
        for (let i in root) {
            if (isTag(i)) {// 检测是否为标签
                if (root[i].constructor !== {}.constructor) {//是标签但没有子项
                    var el = createElement(i, p)
                    var toAdd = compileModule(data, root[i], j)
                    if (el.tagName == 'INPUT') {
                        el.value = toAdd
                    } else if (el.tagName == 'IMG') {
                        el.src = toAdd
                    } else {
                        el.innerHTML = toAdd
                    }
                } else { //是标签有子项
                    if (If(root[i])) {//检测有无if
                        continue
                    } else if (root[i].for !== undefined) {//检测有无for
                        var description = root[i].for
                        array = traverseData(data, description.slice(description.search(/\s(\w+)$/) + 1, description.length))//查找数组
                        var itemName = description.match(/\w+/)[0]
                        for (let j = 0; j < array.length; j++) {
                            var el = createElement(i, p)
                            traverse(root[i], el, j, itemName)
                        }
                    } else if (root[i].on !== undefined) {
                        var onWhat = root[i].on
                        var What = removeSpace(onWhat).match(/^\w+(?=<)/).join('')
                        var Function = method[removeSpace(onWhat).match(/(?<=<)\w+(?=>)/).join('')]
                        var abc = document.querySelector('.abc')
                        var el = createElement(i, p)
                        el.addEventListener(What, Function)
                        traverse(root[i], el)
                    } else {//for if on 都没有
                        var el = createElement(i, p)
                        traverse(root[i], el)
                    }
                }
            } else {
                if (isFoeOnIf(i)) continue
                var toAdd = compileModule(data, root[i], j, itemName)
                if (i !== 'text') {
                    p.setAttribute(i, toAdd)
                } else {
                    if (p.tagName == 'INPUT') {
                        p.value = toAdd
                    } else {
                        p.innerHTML = toAdd
                    }
                }
            }
        }
    }
}





