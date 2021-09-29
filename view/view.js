/*
 * @Author: OhtoAi
 * @Date: 2021-09-30 00:07:38
 * @LastEditors: OhtoAi
 * @LastEditTime: 2021-09-30 00:16:12
 * @Description: file content
 */
$(function () {


    var xhr = new XMLHttpRequest();
    xhr.open("get", '/api/img?type=list', true);
    xhr.onload = function () {

        var list = JSON.parse(xhr.responseText).list;

        for (var i = 0; i < list.length; ++i) {
            if(list[i].thumb_url == '')
                list[i].thumb_url = list[i].url;
            $('.content').append(`<div class="photo" data-album-id="16256715358100" data-id="16256719532724">
        <img src="`+list[i].thumb_url+`" width="`+ list[i].width +`"
            height="`+ list[i].height +`" alt="Photo thumbnail" draggable="false">
        <div class="overlay">
            <h1 title="`+list[i].name+`">`+list[i].name+`</h1>
            <a>`+list[i].time+`</a>
        </div>
        <div class="badges">
            <a class="badge  icn-star"><svg class="iconic ">
                    <use xlink:href="#star"></use>
                </svg></a>
            <a class="badge  icn-share"><svg class="iconic ">
                    <use xlink:href="#eye"></use>
                </svg></a>
        </div>
    </div>`)
        }
    };
    xhr.send(form);
});