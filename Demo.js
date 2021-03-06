
var data = {
    array: [
        { a: 'a1' },
        { a: 'a2' },
        { a: 'a3' }
    ],
    src: '../wedd'
}

var tree = {
    div_box: {
        p__demo: 'Demo',
        div__xt: {
            for: 'ar in array',
            text: 'test is <ar.a>!!!',
            src: '<src>',
            li__dispaly: 'children'
        },
        input__input: '双向数据绑定'
    }
}

export default{
    data,
    tree
}






