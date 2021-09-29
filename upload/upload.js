$(function () {
    //阻止浏览器默认行为。
    $(document).on({
        dragleave: function (e) {
            //拖离
            e.preventDefault();
        },
        drop: function (e) {
            //拖后放
            e.preventDefault();
        },
        dragenter: function (e) {
            //拖进
            e.preventDefault();
        },
        dragover: function (e) {
            //拖来拖去
            e.preventDefault();
        },
    });

    var box = document.getElementById("dropbox"); //拖拽区域

    box.addEventListener(
        "drop",
        function (e) {
            e.preventDefault(); //取消默认浏览器拖拽效果
            var fileList = e.dataTransfer.files; //获取文件对象
            //检测是否是拖拽文件到页面的操作
            if (fileList.length == 0) {
                return false;
            }
            addFiles(fileList);
        },
        false
    );
});

function getFirstReadyImageDiv() {
    return $('.upload-image-preview-div:not([upload-status])').first();
}
function hasAnyImagToUpload() {
    return $('.upload-image-preview-div:not([upload-status])').length > 0;
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function resizeImage(src, callback, w, h) {
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        im = new Image();
    w = w || 0,
        h = h || 0;
    im.onload = function () {
        //为传入缩放尺寸用原尺寸
        !w && (w = this.width);
        !h && (h = this.height);
        //以长宽最大值作为最终生成图片的依据
        if (w !== this.width || h !== this.height) {
            var ratio;
            if (w > h) {
                ratio = this.width / w;
                h = this.height / ratio;
            } else if (w === h) {
                if (this.width > this.height) {
                    ratio = this.width / w;
                    h = this.height / ratio;
                } else {
                    ratio = this.height / h;
                    w = this.width / ratio;
                }
            } else {
                ratio = this.height / h;
                w = this.width / ratio;
            }
        }
        //以传入的长宽作为最终生成图片的尺寸
        if (w > h) {
            var offset = (w - h) / 2;
            canvas.width = canvas.height = w;
            ctx.drawImage(im, 0, offset, w, h);
        } else if (w < h) {
            var offset = (h - w) / 2;
            canvas.width = canvas.height = h;
            ctx.drawImage(im, offset, 0, w, h);
        } else {
            canvas.width = canvas.height = h;
            ctx.drawImage(im, 0, 0, w, h);
        }
        callback(canvas.toDataURL("image/png"));
    }
    im.src = src;
}

function thumbImage(src, callback) {
    return resizeImage(src, callback, 200, 200);
}

function uuid() {
    var temp_url = URL.createObjectURL(new Blob());
    var uuid = temp_url.toString();
    URL.revokeObjectURL(temp_url);
    return uuid.substr(uuid.lastIndexOf("/") + 1);
}

//将blob转换为file
function blobToFile(theBlob, fileName) {
    return new File([theBlob], fileName)
}

function uploadFiles(beforeUpload, afterUpload) {

    if ($("#author").val() == "") {
        alert("需要填写Author字段");
        return;
    }

    $('.upload-image-preview-div[upload-status=failed]').removeAttr('upload-status');
    
    if (beforeUpload != null && beforeUpload != undefined)
        beforeUpload();
    

    var author = $("#author").val();
    var tags = $("input[name='age']:checked").val();
    if ($("#cust_tags").val() != "") tags += "," + $("#cust_tags").val();

    function uploadOneFile() {

        if (!hasAnyImagToUpload()) {
            if (beforeUpload != null && afterUpload != undefined)
                afterUpload();;
            return;
        }

        var onLoadDiv = getFirstReadyImageDiv();
        onLoadDiv.attr('upload-status', 'doing')

        let uid = '#' + onLoadDiv.attr('id');

        // args
        var uploadPath = "/api/img?op=upload";

        var form = new FormData();
        form.append("image", blobToFile(dataURLtoBlob(onLoadDiv.children('img').attr('ori-src')), onLoadDiv.children('img').attr('file')));
        form.append("thumb", blobToFile(dataURLtoBlob(onLoadDiv.children('img').attr('src')), 'thumb_' + onLoadDiv.children('img').attr('file')));
        form.append("author", author);
        form.append("tags", tags);
        form.append("type", onLoadDiv.children('img').attr('ori-type'));
        form.append("width", onLoadDiv.children('img').attr('ori-width'));
        form.append("height", onLoadDiv.children('img').attr('ori-height'));


        var xhr = new XMLHttpRequest();
        xhr.open("post", uploadPath, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status != 200) {
                console.log(xhr.responseText);
                $(uid).attr('upload-status', 'failed')
                uploadOneFile();
            }
        }
        xhr.onload = function () {
            console.log(xhr.responseText);
            console.log($(uid));
            $(uid).attr('upload-status', 'success');
            $(uid).children('img').attr('src', JSON.parse(xhr.responseText).img.thumb_url);
            $(uid).children('img').removeAttr('file');
            $(uid).children('img').removeAttr('ori-src');
            $(uid).children('img').removeAttr('ori-width');
            $(uid).children('img').removeAttr('ori-height');
            $(uid).children('img').removeAttr('ori-type');
            $(uid).children('img').removeAttr('ori-type');
            uploadOneFile();
        };
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                $(uid).attr('upload-percent', percentComplete);
                $('.upload-image-background', $(uid)).css('height', percentComplete == 100 ? '' : (100 - percentComplete) + '%');
                console.log($(uid).children('img').attr('file') + "上传中." + percentComplete + '%');
            }
        }, false);
        xhr.send(form);
    }
    uploadOneFile();
}

function onFileUploadButtonChange() {
    var files = document.getElementById("choose_image_input").files;

    if (files.length < 0) {
        console.log('empty files');
        return;
    }
    addFiles(files);
}

function formatFileSize(value) {
    if (value == null || value == '') {
        return "0 B";
    }
    var unitArr = new Array("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2);//保留的小数位数
    return size + unitArr[index];
}

function updateListInfo() {
    return;
    $('#upload-list-info').html(
        `<p>Ready(` + $('.upload-image-preview-div:not([upload-status])').length + `)</p>`
        + `<p>Failed(` + $('.upload-image-preview-div[upload-status=failed]').length + `)</p>`
        + `<p>Success(` + $('.upload-image-preview-div[upload-status=success]').length + `)</p>`
    )
}

function onImageAdded(f, img) {
    var uid = uuid();
    $("#fileListDiv").append(
        `<div class="upload-image-preview-div" id=` + uid + `>`
        + `<img file="` + f.name + `" ori-width=` + img.width + ` ori-height=` + img.height + ` ori-type=` + f.type.substr(f.type.lastIndexOf('/') + 1) + ` ori-src="` + img.src + `"/>`
        + `<i class="del"></i>`
        + `<p class ="upload-image-name">` + f.name + `</p>`
        + `<p class ="upload-image-size"> 大小: ` + formatFileSize(f.size) + `</p>`
        + `<div class="upload-image-loader-wrapper">`
        + `<div class="upload-image-background"></div>`
        + `<div class="upload-image-loader"></div></div></div>`);
    thumbImage(img.src, (thumb) => $('#' + uid).children('img').attr('src', thumb));
}

function addFiles(files) {
    var errstr = "";

    function addToList(index = 0) {
        if (index >= files.length) {
            $('#choose_image_input').val('');
            return;
        }
        var f = files[index];

        // 查类型
        if (f.type.substr(0, 6) != "image/") {
            errstr += f.name + "\n";
            addToList(index + 1);
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            //加载图片获取图片真实宽度和高度
            var image = new Image();

            image.onload = function (e) {
                onImageAdded(f, image);
                // 下一个
                addToList(index + 1);
            };
            image.src = data;
        };
        reader.readAsDataURL(f);
    }
    addToList();

    if (errstr != "") {
        alert("文件格式错误:" + errstr);
    }
}

$(function () {

    // change wallpaper
    if (self.location.host.substr(0, 9) == '127.0.0.1'
        || self.location.host.substr(0, 9) == 'localhost') {
        console.log('local server test.')
    }
    else if (self == top) {
        console.log('use top-age wallpaper as background.')
        $('.app').attr('top-page', true);
    }

    //删除图片
    $(".upload-image-wrapper").on("click", ".del", function () {
        $(this).parent().remove();
    });

    // 上传文件
    $('.upload_button').click(function () {
        uploadFiles(function () {
            $('.upload_button').attr('disabled', true);
            $(window).bind('beforeunload', function () {
                return '确认离开当前页面吗？未上传的文件将会丢失！';
            });
            $('#upload-list-info').attr('on-upload', true);
        }, function()
        {
            $('.upload_button').removeAttr('disabled');
            $(window).unbind('beforeunload');
            $('#upload-list-info').removeAttr('on-upload')
        });
    });

    // 选择文件
    $('#dropbox').click(() => $('#choose_image_input').click());

    // change
    $(".upload-image-wrapper").bind('DOMNodeInserted', updateListInfo);
    $(".upload-image-wrapper").bind('DOMNodeRemoved', updateListInfo);
    $(".upload-image-wrapper").bind('DOMNodeRemovedFromDocument', updateListInfo);
    $(".upload-image-wrapper").bind('DOMAttrmodified', updateListInfo);
});