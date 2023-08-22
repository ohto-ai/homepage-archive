// loading
// 监听加载状态改变
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        $("#loading")
            .animate(
                {
                    opacity: "0",
                },
                2000
            )
            .hide(1);
    }
};