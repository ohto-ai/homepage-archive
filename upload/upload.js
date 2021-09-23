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
//将base64转换为blob
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

//将blob转换为file
function blobToFile(theBlob, fileName) {
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

function uploadFiles() {
    if ($("#author").val() == "") {
        alert("需要填写Author字段");
        return;
    }

    var author = $("#author").val();
    var tags = $("input[name='age']:checked").val();
    if ($("#cust_tags").val() != "") tags += "," + $("#cust_tags").val();

    function uploadOneFile() {

        if (!hasAnyImagToUpload()) {
            // reload();
            return;
        }

        var uploadPath = "/api/img?op=upload&author=" + author + "&tags=" + tags; // 接收上传文件的后台地址
        // FormData 对象

        var onLoadDiv = getFirstReadyImageDiv();
        
        var form = new FormData();
        form.append("file", blobToFile(dataURLtoBlob(onLoadDiv.children('img').attr('src'))));
        // XMLHttpRequest 对象
        var xhr = new XMLHttpRequest();
        xhr.open("post", uploadPath, true);
        xhr.onload = function () {
            onLoadDiv.attr('upload-status', 'uploaded');
            uploadOneFile();
        };
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                console.log("正在提交." + percentComplete.toString() + '%');        //在控制台打印上传进度
            }
        }, false);
        onLoadDiv.attr('upload-status', 'onupload')
        xhr.send(form);
    }
    uploadOneFile();
}

function onFileUploadButtonChange() {
    var files = document.getElementById("file").files;

    if (files.length < 0) {
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

function onImageAdded(f, img) {
    document.getElementById("fileListDiv").innerHTML +=
        `<div class="upload-image-preview-div">`
        + `<img src="` + img.src + `"/>`
        + `<i class="del"></i>`
        + `<p class ="upload-image-name">` + f.name + `</p>`
        + `<p class ="upload-image-size"> 大小: ` + formatFileSize(f.size) + `</p>`
        + `<div class="upload-image-loader-wrapper">`
        + `<div class="upload-image-loader"></div></div></div>`;
}

function addFiles(files) {
    var errstr = "";

    function addToList(index = 0) {
        if (index >= files.length)
            return;
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

//删除图片
$(".upload-image-wrapper").on("click", ".del", function () {
    $(this).parent().remove();
});
