$(function () {
    var text = $(".font3d-box").attr('text');
    $(".font3d-box").empty();
    $(".font3d-box").append("<p></p>");
    for (i = 0; i < text.length; i++) {
        $(".font3d-box p").append("<span data-text=\"" + text.charAt(i) + "\">" + text.charAt(i) + "</span>\n");
    }
});