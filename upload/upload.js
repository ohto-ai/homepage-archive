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

window.onload = function () {
    if (self.location.host.substr(0, 9) == '127.0.0.1'
        || self.location.host.substr(0, 9) == 'localhost')
        return;
    if (self == top) {
        $('.app').attr('top-page', true);
    }
}

function getDivByUid(uid) {
    return $('.upload-image-preview-div[uid=' + uid + ']').first();
}
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

function uploadFiles() {

    if ($("#author").val() == "") {
        alert("需要填写Author字段");
        return;
    }

    $('.upload_button').attr('disabled', true);
    $('#upload-list-info').attr('on-upload', true);
    $('.upload-image-preview-div[upload-status=failed]').removeAttr('upload-status');

    var author = $("#author").val();
    var tags = $("input[name='age']:checked").val();
    if ($("#cust_tags").val() != "") tags += "," + $("#cust_tags").val();

    function uploadOneFile() {

        if (!hasAnyImagToUpload()) {
            $('.upload_button').removeAttr('disabled');
            $('#upload-list-info').removeAttr('on-upload');
            return;
        }

        var onLoadDiv = getFirstReadyImageDiv();
        onLoadDiv.attr('upload-status', 'doing')

        if (onLoadDiv.attr('uid') == undefined) {
            onLoadDiv.attr('uid', uuid());
            console.log('generate uid ' + onLoadDiv.attr('uid'));
        }

        let uid = onLoadDiv.attr('uid');

        // args
        var uploadPath = "/api/img?op=upload";

        var form = new FormData();
        form.append("file", blobToFile(dataURLtoBlob(onLoadDiv.children('img').attr('src')), onLoadDiv.children('img').attr('file')));
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
                getDivByUid(uid).attr('upload-status', 'failed')
                uploadOneFile();
            }
        }
        xhr.onload = function () {
            console.log(xhr.responseText);
            var div = getDivByUid(uid);
            div.attr('upload-status', 'success');
            updateListInfo();
            div.children('img').attr('src', JSON.parse(xhr.responseText).list[0].url);
            uploadOneFile();
        };
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var div = getDivByUid(uid);
                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                div.attr('upload-percent', percentComplete);
                $('.upload-image-background', div).css('height', percentComplete == 100 ? '' : (100 - percentComplete) + '%');
                console.log(div.children('img').attr('file') + "上传中." + percentComplete + '%');
            }
        }, false);
        xhr.send(form);
    }
    uploadOneFile();
}

function onFileUploadButtonChange() {
    var files = document.getElementById("file").files;

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
    $('#upload-list-info').html(
        `<p>Ready(` + $('.upload-image-preview-div:not([upload-status])').length + `)</p>`
        + `<p>Failed(` + $('.upload-image-preview-div[upload-status=failed]').length + `)</p>`
        + `<p>Success(` + $('.upload-image-preview-div[upload-status=success]').length + `)</p>`
    )
}

function onImageAdded(f, img) {
    $("#fileListDiv").append(
        `<div class="upload-image-preview-div" uid=` + uuid() + `>`
        + `<img file="` + f.name + `" ori-width=` + img.width + ` ori-height=` + img.height + ` ori-type=` + f.type.substr(f.type.lastIndexOf('/') + 1) + ` src="` + img.src + `"/>`
        + `<i class="del"></i>`
        + `<p class ="upload-image-name">` + f.name + `</p>`
        + `<p class ="upload-image-size"> 大小: ` + formatFileSize(f.size) + `</p>`
        + `<div class="upload-image-loader-wrapper">`
        + `<div class="upload-image-background"></div>`
        + `<div class="upload-image-loader"></div></div></div>`);
}

function addFiles(files) {
    var errstr = "";

    function addToList(index = 0) {
        if (index >= files.length) {
            $('#file').val('');
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

window.onload = function () {
    //删除图片
    $(".upload-image-wrapper").on("click", ".del", function () {
        $(this).parent().remove();
    });

    // 上传文件
    $('.upload_button').click(uploadFiles);

    // 选择文件
    $('#dropbox').click(() => file.click());

    // change
    $(".upload-image-wrapper").bind('DOMNodeInserted', updateListInfo);
    $(".upload-image-wrapper").bind('DOMNodeRemoved', updateListInfo);
    $(".upload-image-wrapper").bind('DOMNodeRemovedFromDocument', updateListInfo);
    $(".upload-image-wrapper").bind('DOMAttrmodified', updateListInfo);
}