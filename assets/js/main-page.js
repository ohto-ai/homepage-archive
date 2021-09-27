/*
 * @Author: OhtoAi
 * @Date: 2021-09-24 13:14:10
 * @LastEditors: OhtoAi
 * @LastEditTime: 2021-09-24 13:59:48
 * @Description: file content
 */

$(function () {
    $('.svg-wrapper').each(function () {

        if ($(this).attr('user-define-content') == undefined) {
            var content = $(this).attr('content');
            if ((content == undefined || content == '') && !(this.id == undefined || this.id == '')) {
                content = this.id.split('_')[0];
            }
            $(this).html(`<svg height="40" width="150" xmlns="http://www.w3.org/2000/svg">
                            <rect class="svg_button" height="40" width="150" />
                            <div id="text_div">
                                <a>
                                    <span class="spot"></span>
                                    `+ content + `
                                </a>
                            </div>
                        </svg>`);
        }

        if ($(this).attr('external-link') != undefined) {
            $('a', $(this)).attr('href', $(this).attr('external-link'));
            $('a', $(this)).append(`<i class="fa fa-external-link" aria-hidden="true"></i>`);
            return;
        }
        if (this.id == undefined || this.id == '')
            return;
        var id = this.id.split('_')[0];

        $("#" + id + "_button").click(function () {
            $(".inner_frames").removeAttr('current-page');
            $(".svg-wrapper").removeAttr('current-page');

            var button = $("#" + id + "_button");
            var frame = $("#" + id + "_frame");

            if (frame.length <= 0) {
                $('.sub-frame-wrapper').append(`<iframe id="` + id + "_frame" + `" class="inner_frames" src="` + button.attr('data-src') + `"></iframe>`);
                frame = $("#" + id + "_frame");
                console.log('frame created ' + frame.attr('id'));
            }

            if (frame.attr('src') == null || frame.attr('src') == ""
                || button.attr('always-reload') != undefined) {
                frame.attr('src', button.attr('data-src') + "&token=" + Math.random());
                console.log("load wp_page");
            }

            frame.attr("current-page", true);
            if (button.attr('no-button-change') == undefined) {
                button.attr("current-page", true);
            }
        })
    })
});