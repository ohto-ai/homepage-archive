// loading
// 监听加载状态改变
document.onreadystatechang = function () {
    $("#loading")
        .animate(
            {
                opacity: "0",
            },
            2000
        )
        .hide(1);
};