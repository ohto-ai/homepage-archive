let options={misc:{artwork_scroll:0},theme:{background:{r:0,g:0,b:0},color_1:{r:0,g:0,b:0},color_2:{r:0,g:0,b:0},color_mix_1:{r:0,g:0,b:0},color_mix_2:{r:0,g:0,b:0}},
    audio: {
        multiplier: 1.0, // Multiplied Before Processing     *=
        sensitivity: 1.0, // Multiplied While Processing     *=
        intensity: 100.0,  // Multiplied After Processing     *=
        decay: 0.25
    }
};

// GLOBAL STUFF
let internal = {
    power: 0,
    bass: 0
}

function ParseColor(value) {
    let splv = value.split(" "),
        result = {
            r: 1 * splv[0],
            g: 1 * splv[1],
            b: 1 * splv[2]
        };
    return console.log(splv + " " + result), result
}

function MoveIt() {
    var w, h = screen.width / 2,
        x, l = h - event.clientX,
        img;
    document.getElementById("art").style.left = `${50-l/h*50*(options.misc.artwork_scroll/100)}%`
}
window.onload = function () {
    console.log("Loaded!"), window.wallpaperPropertyListener = {
        applyUserProperties: function (properties) {
            properties.background && (options.theme.background = ParseColor(properties.background.value)), properties.color_1 && (options.theme.color_1 = ParseColor(properties.color_1.value)), properties.color_2 && (options.theme.color_2 = ParseColor(properties.color_2.value)), properties.color_mix_1 && (options.theme.color_mix_1 = ParseColor(properties.color_mix_1.value)), properties.color_mix_2 && (options.theme.color_mix_2 = ParseColor(properties.color_mix_2.value)), properties.artwork_scroll && (options.misc.artwork_scroll = properties.artwork_scroll.value)

            if (properties.audio_multiplier)  options.audio.multiplier = properties.audio_multiplier.value;
            if (properties.audio_sensitivity) options.audio.sensitivity = properties.audio_sensitivity.value;
            if (properties.audio_intensity)   options.audio.intensity = properties.audio_intensity.value;
            if (properties.audio_decay)       options.audio.decay = properties.audio_decay.value;
        }
    };
    window.wallpaperRegisterAudioListener(wallpaperAudioListener);
};

//#region Helpers
var pinkNoise = [1.1760367470305,0.85207379418243,0.68842437227852,0.63767902570829,0.5452348949654,0.50723325864167,0.4677726234682,0.44204182748767,0.41956517802157,							0.41517375040002,0.41312118577934,0.40618363960446,0.39913707474975,0.38207008614508,							0.38329789106488,0.37472136606245,0.36586428412968,0.37603017335105,0.39762590761573,							0.39391828858591,0.37930603769622,0.39433365764563,0.38511504613859,0.39082579241834,							0.3811852720504,0.40231453727161,0.40244151133175,0.39965366884521,0.39761103827545,							0.51136400422212,0.66151212038954,0.66312205226679,0.7416276690995,0.74614971301133,							0.84797007577483,0.8573583910469,0.96382997811663,0.99819377577185,1.0628692615814,							1.1059083969751,1.1819808497335,1.257092297208,1.3226521464753,1.3735992532905,							1.4953223705889,1.5310064942373,1.6193923584808,1.7094805527135,1.7706604552218,							1.8491987941428,1.9238418849406,2.0141596921333,2.0786429508827,2.1575522518646,							2.2196355526005,2.2660112509705,2.320762171749,2.3574848254513,2.3986127976537,2.4043566176474,2.4280476777842,2.3917477397336,2.4032522546622,2.3614180150678];

function correctWithPinkNoiseResults( data )
{
	for( var i = 0; i < 64; i++ )
	{
		data[ i ] /= pinkNoise[ i ];
		data[ i+64 ] /= pinkNoise[ i ];
	}
	return data;
}

function isInt(n) {
	return n % 1 === 0;
}

let freqIndex = [  26,48,73,93,115,138,162,185,
	207,231,254,276,298,323,346,370,
	392,414,436,459,483,507,529,552,
	575,598,621,644,669,714,828,920,
	1057,1173,1334,1472,1655,1840,2046,2253,
	2483,2735,3012,3287,3609,3930,4275,4665,
	5056,5493,5929,6412,6917,7446,7998,8618,
	9261,9928,10617,11352,11996,12937,13718,14408];

let idxToFreq = function( idx )
{
	return freqIndex[ idx ];
}
	
let freqToIdx = function( freq )
{
	for( var i = 0; i < 63; i++ )
	{
		var f1 = freqIndex[ i ];
		if( freq < f1 )	
		{
			if( i == 0 ) return 0;
			var f2 = freqIndex[ i-1 ];
			var f2 = freq - f2;
			var f1 = f1 - freq;
			if( f1 < f2 ) return i;
			return i-1;
		}
	}
	return 63;
}

//#endregion
let prev_frequency_array = new Array(128).fill(0);
let frequency_array = new Array(128).fill(0);
function wallpaperAudioListener(audioData) {
    
    // frequency_array = audioData;
    audioData = correctWithPinkNoiseResults(audioData);
    
    for (let i = 0; i < audioData.length; i++)  {
        audioData[i] = prev_frequency_array[i] * 0.33 + audioData[i] * 0.66;
        prev_frequency_array[i] = audioData[i];
        audioData[i] = options.audio.sensitivity * Math.pow( (audioData[i] * options.audio.multiplier) / options.audio.sensitivity, 3 );
        
        let val = ((audioData[ Math.max(i-1, 0) ] * 1 + audioData[ i ] * 2 + audioData[ Math.min(i+1, audioData.length - 1) ] * 1) / 4) * options.audio.intensity;
        if (frequency_array[i] < val) {
            frequency_array[i] = val;
        } else {
            let nval = frequency_array[i] - (options.audio.decay * frequency_array[i]);
            frequency_array[i] = Math.max(nval, 0);
        }

        internal.power += frequency_array[i];
    }
    internal.power /= frequency_array.length;
    
    for (let ii = 0; ii < 6; ii++) {
        internal.bass += frequency_array[ii];
    }
    
    internal.bass /= 6;
    // ---------------

    // frequency_array = correctWithPinkNoiseResults(frequency_array);
}