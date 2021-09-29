/*
 * @Author: OhtoAi
 * @Date: 2021-09-30 00:07:38
 * @LastEditors: OhtoAi
 * @LastEditTime: 2021-09-30 01:04:58
 * @Description: file content
 */

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

$(function () {
    var form = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open("get", '/api/img?type=list&author=ohtoai', true);
    xhr.onload = function () {

        var list = JSON.parse(xhr.responseText).list;

        for (var i = 0; i < list.length; ++i) {
            console.log(list[i]);
            if (list[i].thumb_url == '') {
                continue;
            }
            $('.content').append(`<div class="photo" id=` + list[i].uid + `>
        <img src="`+ list[i].thumb_url + `" data-src="` + list[i].url + `" width="` + list[i].width + `"
            height="`+ list[i].height + `" alt="Photo thumbnail" draggable="false">
        <div class="overlay">
            <h1 title="`+ list[i].name + `">` + list[i].name + `</h1>
            <a>`+ list[i].time + `</a>
        </div>
    </div>`)
        }
    };
    xhr.send(form);

    $(".content").on("click", ".photo", function () {
        $("#imageview").children('img').attr('src', $(this).children('img').attr('data-src'));
        $("#imageview").css('display', 'block');
    });
    $("#imageview").on("click", "img", function () {
        $("#imageview").css('display', 'none');
    });
});