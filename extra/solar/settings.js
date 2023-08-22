var useScheme = false;
var jsColor = 'rgb(0,0,0)';
window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.themeOn) {
            if (properties.themeOn.value){
                useScheme = true;
                document.body.style.background = jsColor;
            }
            else {
                document.body.style.background = 'radial-gradient(ellipse at bottom, #303a49 0, #151628 100%)';
            }
        }
        
        if(properties.schemecolor) {
            var c = properties.schemecolor.value.split(' ').map(function(c) {
                return Math.ceil(c * 255)
            });
            var color = 'rgb(' + c + ')';
            jsColor = color;
            if (useScheme){
                document.body.style.background = color;
            }
        }

        if (properties.stars1) {
            var stars1 = properties.stars1.value;
            var star1css = document.getElementById('stars');
            var conString1 = "animStar s linear infinite";
            star1css.style.animation = [conString1.slice(0, 9), stars1, conString1.slice(9)].join('');
        }

        if (properties.stars2) {
            var stars2 = properties.stars2.value;
            var star2css = document.getElementById('stars2');
            var conString2 = "animStar s linear infinite";
            star2css.style.animation = [conString2.slice(0, 9), stars2, conString2.slice(9)].join('');
        }

        if (properties.stars3) {
            var stars3 = properties.stars3.value;
            var star3css = document.getElementById('stars3');
            var conString3 = "animStar s linear infinite";
            star3css.style.animation = [conString3.slice(0, 9), stars3, conString3.slice(9)].join('');
        }
        if (properties.zoom) {
            var zoomValue = properties.zoom.value;
            var zoomcss = document.getElementById('solar-syst');
            zoomcss.style.zoom = [zoomValue, '%'].join('');
        }
        if (properties.starsOn) {
            if (properties.starsOn.value){
                var offStars = document.getElementById('stars');
                var offStars2 = document.getElementById('stars2');
                var offStars3 = document.getElementById('stars3');
                offStars.style.opacity = '1';
                offStars2.style.opacity = '1';
                offStars3.style.opacity = '1';
            }
            else {
                var offStars = document.getElementById('stars');
                var offStars2 = document.getElementById('stars2');
                var offStars3 = document.getElementById('stars3');
                offStars.style.opacity = '0';
                offStars2.style.opacity = '0';
                offStars3.style.opacity = '0';
            }
        }
        if (properties.solarOn) {
            if (properties.solarOn.value){
                var solar = document.getElementById('solar-syst');
                solar.style.opacity = '1';
            }
            else {
                var solar = document.getElementById('solar-syst');
                solar.style.opacity = '0';
            }
        }
    }
};
