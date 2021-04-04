module.exports = {
  entry: './index.js',
  output: {
    filename: 'boundle.js',
    path: __dirname
  },
  module: {
    rules: [
      {
        test: /\.css$/,    //打包规则应用到以css结尾的文件上
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(ttf|woff|woff2|svg|eot|svg+xml)$/,
        use: 'url-loader'
      },
      {
        test: /\.(jpg|jpeg|webp|png|gif)$/,
        use: 'file-loader'
      }
    ]
  },
  watch: true,
}
