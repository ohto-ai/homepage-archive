var cubes = $('#loader .cube');
var sent = 0;
var travelTime = 5000;

function sendCube() {
    var c = $(cubes).get(sent);
    if(sent==0) sent = 1;
    else if(sent==1) sent = 0;
    
    $(c).animate({ left: "100%" }, 
        travelTime, "linear", 
        function() {
            $(c).css('left', '-40px');
        });
}

sendCube();
setInterval(function() {
    sendCube();
}, travelTime*.85);