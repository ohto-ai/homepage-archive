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

function resizeImageCut(src, callback, w, h) {
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
            if (w < h) {
                ratio = this.width / w;
                h = this.height / ratio;
            } else if (w === h) {
                if (this.width < this.height) {
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
        if (w < h) {
            var offset = (w - h) / 2;
            canvas.width = canvas.height = w;
            ctx.drawImage(im, 0, offset, w, h);
        } else if (w > h) {
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

(function ($) {
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
})(jQuery);

(function ($) {
    $.hasUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "(=([^&]*))?(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return true; return false;
    }
})(jQuery);

(function ($) {
    $.getUrlPathLast = function () {
        return window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1);
    }
})(jQuery);


$(function () {
    var form = new FormData();
    var xhr = new XMLHttpRequest();
    var author = $.getUrlParam('author');
    var tags = $.getUrlParam('tags');
    var r18 = $.hasUrlParam('r18');

    console.log(r18 ? "r18 off" : "r18 on");

    if (author == '' || author == null)
        author = $.getUrlPathLast();
    if (author == '' || author == null)
        author = "undefined";

    let path = '/api/img?type=list&author=' + author;
    if (tags != '' && tags != null)
        path += '&tags=' + tags;
    xhr.open("get", path, true);
    xhr.onload = function () {

        var list = JSON.parse(xhr.responseText).list;
        if (list == null || list == undefined)
            return;

        for (var i = 0; i < list.length; ++i) {
            if (list[i].thumb_url == '') {
                let id = '#' + list[i].uid;
                thumbImage(list[i].url, thumb => $(id).children('img').attr('src', thumb));
            }
            if (list[i].tags.indexOf('porn') != -1 && !r18) {
                console.log(list[i]);
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
        $('.header_title').html($(this).children('.overlay').children('h1').attr('title'));
        $(document).attr('title', 'Wallpaper View - ' + $(this).children('.overlay').children('h1').attr('title'));
        $("#imageview").children('img').attr('src', $(this).children('img').attr('data-src'));
        $("#imageview").css('display', 'block');
    });
    $("#imageview").click(function () {
        $("#imageview").css('display', 'none');
        $('.header_title').html('Wallpaper View');
        $(document).attr('title', 'Wallpaper View');
    });
});
