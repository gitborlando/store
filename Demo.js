
var data = {
    array: [
        { a: 'a1' },
        { a: 'a2' },
        { a: 'a3' }
    ],
    src: '../wedd',
    value: '数据绑定',
}

var tree = {
    div_box: {
        h1__demo: 'Demo',
        h3__text: {
            for: 'ar in array',
            text: 'test is <ar.a>!!!',
            src: '<src>',
            li__dispaly: 'children'
        },
        input__input: '<value>',
        button: {
            text: '点击',
            on: 'click <click>'
        }

    }
}

var method = {
    click
}


function click() {
    alert('hello world')
}

export default {
    data,
    tree,
    method
}






