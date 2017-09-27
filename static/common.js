/**
 * Created by Administrator on 2017/7/21 0021.
 * js文件分片上传
 */
var UP = {
    /**
     * [__init 初始化]
     * @Author   王文凡
     * @DateTime 2017-09-27
     * @version  1.0
     * @param    {[type]}   param [description]
     * @return   {[type]}         [description]
     */
    __init: function(param) {
        this.__input.param = param;
    },
    /**
     * [__msg 定义提示信息]
     * @type {Object}
     */
    __msg: {
        done: '上传成功',
        failed: '上传失败',
        in : '上传中...',
        paused: '暂停中...',
        incomplete: '上传不完整'
    },
    /**
     * [__input 定义状态值和变量]
     * @type {Object}
     */
    __input: {
        //上传按钮对象
        fo: null,
        //暂停状态
        isPaused: 0,
        //浏览器刷新中断状态
        flushStatus: 0,
        param: null,
        file_obj:null
    },
    /**
     * [__show 选择上传显示上传信息]
     * @Author   王文凡
     * @DateTime 2017-09-27
     * @version  1.0
     * @param    {[object]}   self [file input对象]
     * @return   {[type]}        [description]
     */
    __show: function(self) {
        var file,
            uploadItem = [],
            uploadItemTpl = $('#file-upload-tpl').html(),
            size,
            percent,
            progress = '未上传',
            uploadVal = '开始上传';

        for (var i = 0, j = self.files.length; i < j; ++i) {
            file = self.files[i];
            percent = undefined;

            // 计算文件大小
            size = file.size > 1024 ? file.size / 1024 > 1024 ? file.size / (1024 * 1024) > 1024 ? (file.size / (1024 * 1024 * 1024)).toFixed(2) + 'GB' : (file.size / (1024 * 1024)).toFixed(2) + 'MB' : (file.size / 1024).toFixed(2) + 'KB' : (file.size).toFixed(2) + 'B';

            // 初始通过本地记录，判断该文件是否曾经上传过
            percent = window.localStorage.getItem(file.name + '_p');

            if (percent && percent !== '100.0') {
                progress = '已上传 ' + percent + '%';
                uploadVal = '继续上传';
            }

            // 更新文件信息列表
            uploadItem.push(uploadItemTpl
                .replace(/{{fileName}}/g, file.name)
                .replace('{{fileType}}', file.type || file.name.match(/\.\w+$/) + '文件')
                .replace('{{fileSize}}', size)
                .replace('{{progress}}', progress)
                .replace('{{totalSize}}', file.size)
                .replace('{{uploadVal}}', uploadVal)
            );
        }

        $('#upload-list').children('tbody').html(uploadItem.join('')).end().show();
    },
    /**
     * [__allUpload 点击全部上传按钮]
     * @Author   王文凡
     * @DateTime 2017-09-27
     * @version  1.0
     * @return   {[type]}   [description]
     */
    __allUpload: function(self) {
        // 未选择文件
        if (!$(this.__input.param.myFile).val()) {
            $(this.__input.param.myFile).focus();
        }
        // 模拟点击其他可上传的文件
        else {
            $('#upload-list .upload-item-btn').each(function() {
                $(this).click();
            });
        }
    },
    /**
     * 上传文件时，提取相应匹配的文件项
     * @param  {String} fileName   需要匹配的文件名
     * @return {FileList}          匹配的文件项目
     */
    __findTheFile: function(fileName) {
        var files = $(this.__input.param.myFile)[0].files,
            theFile;

        for (var i = 0, j = files.length; i < j; ++i) {
            if (files[i].name === fileName) {
                theFile = files[i];
                break;
            }
        }
        return theFile ? theFile : [];
    },
    /**
     * [__fileInfo 获取文件基本信息]
     * @Author   王文凡
     * @DateTime 2017-09-27
     * @version  1.0
     * @param    {[type]}   self [文件对象]
     * @return   {[type]}        [description]
     */
    __fileInfo: function(self) {
        var $this = $(self);
        var info = {
            fileThat: $this,
            state: $this.attr('data-state'),
            fileName: $this.attr('data-name'),
            progress: $this.closest('tr').find('.upload-progress'),
            eachSize: 1024,
            totalSize: $this.attr('data-size'),
            chunks: function() {
                return Math.ceil(this.totalSize / this.eachSize);
            },
            percent: 0,
            chunk: 0
        };
        this.__input.file_obj = info;
        return info;
    },
    /**
     * [__toUpload 点击上传按钮]
     * @Author   王文凡
     * @DateTime 2017-09-27
     * @version  1.0
     * @return   {[type]}   [description]
     */
    __toUpload: function(self) {
        var that = this;
        that.__input.fo = self;
        var file_obj = that.__fileInfo(self);

        // 暂停上传操作
        if (file_obj.state === 'uploading') {
            file_obj.fileThat.val('继续上传').attr('data-state', 'paused');
            file_obj.progress.text(that.__msg['paused'] + file_obj.percent + '%');
            that.__input.isPaused = 1;
        }
        // 进行开始/继续上传操作
        else if (file_obj.state === 'paused' || file_obj.state === 'default') {
           
            //中途浏览器刷新断掉后继续上传分片加1
            var c = window.localStorage.getItem(file_obj.fileName + '_chunk');
            if((file_obj.chunks()-1) == c){
                alert("该文件已上传！");return;
            }
            if (c > 1 && that.__input.flushStatus == 0) {
                window.localStorage.setItem(file_obj.fileName + '_chunk', ++c);
            }
            that.__input.isPaused = 0;
            that.__input.flushStatus = 1;
            file_obj.fileThat.val('暂停上传').attr('data-state', 'uploading');
            // 第一次点击上传
            that.__startUpload('first');
        }
    },

    /**
     * [__startUpload 上传操作]
     * @Author   王文凡
     * @DateTime 2017-09-27
     * @version  1.0
     * @param    {[type]}   times [第几次]
     * @return   {[type]}         [description]
     */
    __startUpload: function(times) {
        var that = this;
        var file_obj = that.__input.file_obj;
        console.log("共：" + file_obj.chunks() + "片,总大小：" + file_obj.totalSize);
        // 上传之前查询是否以及上传过分片
        file_obj.chunk = window.localStorage.getItem(file_obj.fileName + '_chunk') || 0;
        file_obj.chunk = parseInt(file_obj.chunk, 10);
        console.log("当前第：" + (file_obj.chunk + 1) + "片");
        // 判断是否为末分片
        var isLastChunk = (file_obj.chunk == (file_obj.chunks() - 1) ? 1 : 0);

        // 如果第一次上传就为末分片，即文件已经上传完成，则重新覆盖上传
        if (times === 'first' && isLastChunk === 1) {
            window.localStorage.setItem(file_obj.fileName + '_chunk', 0);
            chunk = 0;
            isLastChunk = 0;
        }
        // 设置分片的开始结尾
        var blobFrom = file_obj.chunk * file_obj.eachSize, // 分段开始
            blobTo = (file_obj.chunk + 1) * file_obj.eachSize > file_obj.totalSize ? file_obj.totalSize : (file_obj.chunk + 1) * file_obj.eachSize, // 分段结尾
            percent = (100 * blobTo / file_obj.totalSize).toFixed(1), // 已上传的百分比
            timeout = 5000, // 超时时间
            fd = new FormData($('#myForm')[0]);

        fd.append('theFile', that.__findTheFile(file_obj.fileName).slice(blobFrom, blobTo)); // 分好段的文件
        fd.append('fileName', file_obj.fileName); // 文件名
        fd.append('totalSize', file_obj.totalSize); // 文件总大小
        fd.append('isLastChunk', isLastChunk); // 是否为末段
        fd.append('isFirstUpload', times === 'first' ? 1 : 0); // 是否是第一段（第一次上传）
        // 上传
        $.ajax({
            type: 'post',
            url: that.__input.param.ServerUrl,
            data: fd,
            processData: false,
            contentType: false,
            timeout: timeout,
            success: function(rs) {
                rs = JSON.parse(rs);

                // 上传成功
                if (rs.status === 200) {
                    // 记录已经上传的百分比
                    window.localStorage.setItem(file_obj.fileName + '_p', percent);
                    // 已经上传完毕
                    if (file_obj.chunk === (file_obj.chunks() - 1)) {
                        file_obj.progress.text(that.__msg['done']);
                        file_obj.fileThat.val('已经上传').prop('disabled', true).css('cursor', 'not-allowed');
                        if (!$('#upload-list').find('.upload-item-btn:not(:disabled)').length) {
                            $('#upload-all-btn').val('已经上传').prop('disabled', true).css('cursor', 'not-allowed');
                        }
                    } else {
                        // 记录已经上传的分片
                        window.localStorage.setItem(file_obj.fileName + '_chunk', ++file_obj.chunk);
                        //显示上传进度条
                        file_obj.progress.text(that.__msg['in'] + percent + '%');
                        if (!that.__input.isPaused) that.__startUpload();
                    }
                }
                // 上传失败，上传失败分很多种情况，具体按实际来设置
                else if (rs.status === 500) {
                    progress.text(that.__msg['failed']);
                } else if (rs.status === 502) {
                    progress.text(that.__msg['incomplete']);
                }
            },
            error: function() {
                progress.text(that.__msg['failed']);
            }
        });
    }

};


$(function() {
    // 选择文件-显示文件信息
    $(UP.__input.param.myFile).change(function(e) {
        UP.__show(this);
    });

    // 全部上传操作
    $(document).on('click', '#upload-all-btn', function() {
        UP.__allUpload(this);
    });

    // 上传文件
    $(document).on('click', '.upload-item-btn', function() {
        UP.__toUpload(this);
    });
});

//初始化
UP.__init({
    myFile: "#myFile", //fileinput节点
    ServerUrl:"/fileTest.php"//服务器地址
});