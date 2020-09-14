var music = document.getElementById('music');
var musicList = new Array(
    // "assets/music/Alec Benjamin - Let Me Down Slowly.mp3",
    // "assets/music/Neru,鏡音リン,鏡音レン - 病名は愛だった.mp3",
    // "assets/music/Seto - ?.mp3",
    // "assets/music/StickBoi - broken heart／／Demo.mp3",
    // "assets/music/TRA$H - ＤＲＥＡＭ.mp3",
    // "assets/music/不萝 - 戒烟【清脆女声版】（Cover 李荣浩）.mp3",
    // "assets/music/千面音葉7ZH,洛天依 - 朝汐.mp3",
    // "assets/music/接个吻，开一枪,沈以诚,薛明媛 - 失眠飞行.mp3",
    // "assets/music/泠鸢yousa,泠鸢yousaの呆萌忆【管理团队】 - 相思赋.mp3",
    // "assets/music/洛天依,ilem - 勾指起誓.mp3",
    // "assets/music/洛天依,言和,ilem - 深夜诗人.mp3",
    // "assets/music/洛少爷,流风 - 有美人兮（翻自 音阙诗听）.mp3",
    // "assets/music/黑凤梨 洛天依.mp3",
    // "/assets/music/闹闹丶,FFF君,小欧Ω - 老街北.flac"
    "assets/music/Mittsies - Vitality.flac"
);
var soundList = new Array(
    "assets/sound/attacking.ogg",
    "assets/sound/comrade.ogg",
    "assets/sound/conscript_reporting.ogg",
    "assets/sound/da.ogg",
    "assets/sound/for_the_home country.ogg",
    "assets/sound/for_the_union.ogg",
    "assets/sound/moving_out.ogg",
    "assets/sound/order_received.ogg",
    "assets/sound/waiting_orders.ogg",
    "assets/sound/you_are_sure.ogg"
);
function callSound() {
    var index = Math.floor(Math.random() * soundList.length);
    sound.src = soundList[index];
    sound.pause();
    sound.play();
}

function switchRandomMusic() {
    var index = Math.floor(Math.random() * musicList.length);
    music.src = musicList[index];
    music.play();
}

window.onload = function () {
    music.volume = 0.5;
    music.addEventListener("ended", function () {
        if (music.ended)
            switchRandomMusic();
    });
    switchRandomMusic();
}
