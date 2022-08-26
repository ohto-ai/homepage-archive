const musicContainer = document.getElementById("music-container")
const playBtn = document.getElementById("play")
const prevBtn = document.getElementById("prev")
const nextBtn = document.getElementById("next")

const audio = document.getElementById("audio")
const progress = document.getElementById("progress")
const progressContainer = document.getElementById("progress-container")
const title = document.getElementById("title")
const musicCover = document.getElementById("music-cover")

// 音乐信息
const songs = ["LOSER_8-bit",
    "PuppyMmmm_Rayark-NEKO_Title_Mix",
    "YOASOBI-8-bit-QunQing",
    "YOASOBI-8-bit-Ye",
    "YoRHa-Weight_of_the_World_the_End_of_YoRHa",
    "ow-kings-row",
    "Kizuna AI,中田ヤスタカ - AIAIAI",
    "GENERATIONS from EXILE TRIBE - Brand New Story",
    "[BOFXVI] linear ring - enchanted love",
    "ピノキオピー,鏡音リン,初音ミク - ねぇねぇねぇ。",
    "糖风 - Brand New Story 口琴版（翻自 GENERATIONS from EXILE TRIBE）",
    "ななひら - お願い！コンコンお稲荷さま",
    "ow-lijiang-tower"]
const songTitles = [
    "米津玄師-LOSER【8-bit】",
    "NEKO#ФωФ Title Mix",
    "YOASOBI- 群青【8-bit】",
    "夜に駆ける",
    "Weight of the World/the End of YoRHa",
    "Overwatch - 国王大道",
    "Kizuna AI,中田ヤスタカ - AIAIAI",
    "GENERATIONS from EXILE TRIBE - Brand New Story",
    "[BOFXVI] linear ring - enchanted love",
    "ピノキオピー,鏡音リン,初音ミク - ねぇねぇねぇ。",
    "糖风 - Brand New Story 口琴版（翻自 GENERATIONS from EXILE TRIBE）",
    "ななひら - お願い！コンコンお稲荷さま",
    "Overwatch - 漓江塔"];

// 默认从第一首开始
let songIndex = Math.floor(Math.random() * songs.length);
// 将歌曲细节加载到DOM
loadSong(songs[songIndex], songTitles[songIndex])

// 更新歌曲细节
function loadSong(songPath, songTitle) {
    title.innerHTML = songTitle
    audio.src = `/assets/music/${songPath}.mp3`;      // 路径为 music/打上花火.mp3
    musicCover.src = "https://cdn.sep.cc/avatar/abe3aff418f55987552d933a287425af?d=mm&s=200";

}

// 播放歌曲
function playSong() {
    // 元素添加类名
    musicContainer.classList.add("play")
    playBtn.querySelector('i.fas').classList.remove('fa-play')
    playBtn.querySelector('i.fas').classList.add('fa-pause')

    audio.play()
}

// 停止播放
function pauseSong() {
    musicContainer.classList.remove('play');
    playBtn.querySelector('i.fas').classList.add('fa-play');
    playBtn.querySelector('i.fas').classList.remove('fa-pause');

    audio.pause();
}

// 上一首
function prevSong() {
    songIndex--
    if (songIndex < 0) {
        songIndex = songs.length - 1
    }
    // 加载歌曲信息并播放
    loadSong(songs[songIndex], songTitles[songIndex])
    playSong()
}
// 下一首
function nextSong() {
    songIndex++;

    if (songIndex > songs.length - 1) {
        songIndex = 0;
    }

    loadSong(songs[songIndex], songTitles[songIndex])

    playSong();
}

// 进度条更新
function updateProgress(e) {
    // audio.duration: 音频长度
    // audio.currentTime: 音频播放位置
    // 对象解构操作
    const {
        duration,
        currentTime
    } = e.target;
    // e.target = {
    //     duration: 225,  // 当前音频时间长度 
    //     currentTime:0  // 当前播放时间
    // }
    const progressPercent = (currentTime / duration) * 100
    // 进度条
    progress.style.width = `${progressPercent}%`
}
// 设置进度条
function setProgress(e) {
    // progressContainer代理视图宽度
    const width = this.clientWidth
    // 鼠标点击时处于progressContainer里的水平偏移量
    const clickX = e.offsetX

    // audio.duration: 音频长度
    const duration = audio.duration

    // audio.currentTime: 音频播放位置
    audio.currentTime = (clickX / width) * duration
}
// 事件监听
// 1.播放歌曲
playBtn.onclick = function () {
    // 判断当前是否是正在播放

    // const isPlaying = musicContainer.classList.contains('play')
    // if (isPlaying) {
    //     pauseSong()
    // } else {
    //     playSong()
    // }
    musicContainer.classList.contains('play') ? pauseSong() : playSong()
}
// 2.切换歌曲
prevBtn.onclick = prevSong
nextBtn.onclick = nextSong

// 3.播放器进度条相关
// 3.1 设置播放进度
progressContainer.onclick = setProgress
// 3.2 进度条更新
audio.ontimeupdate = updateProgress
// 3.3 歌曲结束后自动下一首
audio.onended = nextSong