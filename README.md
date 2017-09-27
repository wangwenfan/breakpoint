### javascript 分片上传文件demo
> 文件上传是一个使用频率非常高的一个功能。但是项目中总觉得它不够完善。从而暴露出一些细节问题。于是动手写一个分片上传的demo分享出来供大家参考。

![](https://ws1.sinaimg.cn/large/98e19e2dgy1fjy8q0y79xg20i506pwkg.gif)

#### 实现方式
- `JavaScript`有个`slice`函数可以截取文件指定片段大小,然后把文件写入`FormData`，与普通的 `Ajax` 相比，使用 `FormData` 的最大优点就是我们可以异步上传二进制文件。
```javascript
$.ajax({
    url: '/upload',
    type: 'POST',
    cache: false,
    data: FormData, 
    processData: false,
    contentType: false 
}).done(function(res) {
}).fail(function(res) {});
```

>`processData`设置为false。因为`data`值是`FormData`对象，不需要对数据做处理。
`contentType`设置为`false`。因为是由`<form>`表单构造的`FormData`对象，且已经声明了属性`enctype="multipart/form-data"`，所以这里设置为`false`。


- 上传过程中把分片信息存储到`LocalStorage`。还有一种方式是，上传时到服务器去看有没有这个文件，再取回大小。根据这个大小找到当前未上传完的文件的起始位置。当前demo主要用第一种方式实现。
- 服务端用`PHP`来实现。php的`file_put_contents()`函数可以追加写入文件。第一个参数为写入路径，第二个为文件，第三个参数`FILE_APPEND`可以追加写入。具体使用查看：[http://php.net/manual/zh/function.file-put-contents.php](http://php.net/manual/zh/function.file-put-contents.php)

#### 目录结构
```
|-breakpoint
|_____static
|      |___common.js 上传逻辑
|      |__style.css 模板基本样式
|_____upload 附件目录
|
|_____demo.html 模板
|
|_____fileTest.php 服务端文件
```

#### 使用方法
- 下载或clone下来，访问`/demo.html`即可。
- 初始化，commo.js里已有。
```javascript
//初始化
UP.__init({
    myFile: "#myFile", //fileinput节点
    ServerUrl:"/fileTest.php",//服务器地址
    eachSize:1024 //分片大小
});
```

#### 下载地址
[https://github.com/wangwenfan/breakpoint](https://github.com/wangwenfan/breakpoint)