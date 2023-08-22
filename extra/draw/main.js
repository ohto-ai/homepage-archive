$(function(){


  // Init Area

  // All init
  var wVal      = 5;
  var styleDraw = "#000000";
  var startX;
  var startY;
  var colorA;
  var brashiType        = 1;
  var brashiVarFlag     = true;
  var colorVarFlag      = true;
  var ctxVarArray       = [];
  var ctxChengeArray    = ["Black","White","Purple","Blue","Teal","Green","HunterGreen","LimeGreen","Yellow","Orange","Pink","Red"];
  var ctxFillStyleArray = ["#000000","#ffffff","#800080","#0000ff","#008080","#008000","#355e3b","#32cd32","#ffff00","#ffa500","#dda0dd","#ff0000"];
  var imgCanvas         = new Image();

  // Canvas init
  var canvasDraw = document.getElementById('DrawJS');
  var ctxDraw    = canvasDraw.getContext('2d');
  $("#DrawJS").attr('width', window.screen.width);
  $("#DrawJS").attr('height', window.screen.height - 4);
  $("#UserImage").attr('width', window.screen.width);
  $("#UserImage").attr('height', window.screen.height);

  // Color-Map init
  var ctxColor = document.getElementById('canvasColorVar').getContext('2d');
  ctxColor.beginPath();
  ctxColor.arc(24, 24, 24, 0, Math.PI*2, false);
  ctxColor.fill();

  // Color-Map-Palette init
  for (i = 0; i < 12; i++) {
    ctxVarArray[i] = document.getElementById('colorVar'+ctxChengeArray[i]).getContext('2d');
    ctxVarArray[i].fillStyle = ctxFillStyleArray[i];
    ctxVarArray[i].fillRect(0, 0, 32, 32);
  }



  // Event Area

  // Delete Function (Click)
  $("#clear").click(function(e){
    ctxDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
    if (!brashiVarFlag || !colorVarFlag) {
      $(".ToolsBrashiSelect").hide();
      $(".ToolsColorSelectUl").hide();
      brashiVarFlag = true;
      colorVarFlag = true;
    }
    if (imgCanvas) {
      ctxDraw.drawImage(imgCanvas, 0, 0, window.screen.width, window.screen.height);
    }
  });

  // Brashi Function (Click)
  $("#brashi").click(function(e){
    if (brashiVarFlag) { $(".ToolsBrashiSelect").show();brashiVarFlag = false;if(!colorVarFlag){$(".ToolsColorSelectUl").hide();colorVarFlag=true;} }
    else if (!brashiVarFlag) { $(".ToolsBrashiSelect").hide();brashiVarFlag = true; }
  });
  $("#pencil").click(function(e){
    if (brashiType !== 1) {
      brashiType = 1;
      $("#brashi").attr("src", "pencil.png");
    }
  });
  $("#blur").click(function(e){
    if (brashiType !== 2) {
      brashiType = 2;
      $("#brashi").attr("src", "blur.png");
    }
  });
  $("#batu").click(function(e){
    if (brashiType !== 3) {
      brashiType = 3;
      $("#brashi").attr("src", "batu.png");
    }
  });
  $("#brashiRange").on('input', function(e){ $(".rangeChenge").text($(this).val()); });

  // Color-Map Function (Click)
  $("#canvasColorVar").click(function(e){
    if (colorVarFlag) { $(".ToolsColorSelectUl").show();colorVarFlag = false;if(!brashiVarFlag){$(".ToolsBrashiSelect").hide();brashiVarFlag=true;} }
    else if (!colorVarFlag) { $(".ToolsColorSelectUl").hide();colorVarFlag = true; }
  });
  $("#colorVarBlack").click(function(e){ coChenge(0); });
  $("#colorVarWhite").click(function(e){ coChenge(1); });
  $("#colorVarPurple").click(function(e){ coChenge(2); });
  $("#colorVarBlue").click(function(e){ coChenge(3); });
  $("#colorVarTeal").click(function(e){ coChenge(4); });
  $("#colorVarGreen").click(function(e){ coChenge(5); });
  $("#colorVarHunterGreen").click(function(e){ coChenge(6); });
  $("#colorVarLimeGreen").click(function(e){ coChenge(7); });
  $("#colorVarYellow").click(function(e){ coChenge(8); });
  $("#colorVarOrange").click(function(e){ coChenge(9); });
  $("#colorVarPink").click(function(e){ coChenge(10); });
  $("#colorVarRed").click(function(e){ coChenge(11); });

  // Drawing-Lines Function (MouseDown,Move,UP)
  function caDown(e){
    startX = e.pageX - $(this).offset().left;
    startY = e.pageY - $(this).offset().top;
    wVal = $("#brashiRange").val();
    if (!brashiVarFlag || !colorVarFlag) {
      $(".ToolsBrashiSelect").hide();
      $(".ToolsColorSelectUl").hide();
      brashiVarFlag = true;
      colorVarFlag = true;
    }
    if (!(brashiType === 3)) { $("#DrawJS").on("mousemove", caMove); }
  }
  function caMove(e){
    var endX = e.pageX - $('canvas').offset().left;
    var endY = e.pageY - $('canvas').offset().top;

    // Pencil
    if (brashiType === 1) {
      ctxDraw.beginPath();
      ctxDraw.strokeStyle = styleDraw;
      ctxDraw.lineWidth   = wVal;
      ctxDraw.lineCap     = "round";
      ctxDraw.shadowBlur  = 0;
      ctxDraw.shadowColor = 0;
      ctxDraw.moveTo(startX, startY);
      ctxDraw.lineTo(endX, endY);
      ctxDraw.stroke();
    }
    // Blur
    else if (brashiType === 2) {
  		ctxDraw.beginPath();
  		ctxDraw.strokeStyle = styleDraw;
  		ctxDraw.lineWidth   = wVal;
      ctxDraw.lineCap     = "round";
  		ctxDraw.shadowBlur  = wVal;
  		ctxDraw.shadowColor = styleDraw;
  		ctxDraw.moveTo(startX, startY);
  		ctxDraw.lineTo(endX, endY);
  		ctxDraw.stroke();
    }

    startX = endX;
    startY = endY;
  }
  function caUp(e){
    if (!(brashiType === 3)) { $("#DrawJS").off("mousemove", caMove); }
  }

  // Color-Map-Palette-Drawing Function
  function coChenge(chengeInt){
    styleDraw = ctxFillStyleArray[chengeInt];
    ctxColor.clearRect(0, 0, 48, 48);
    ctxColor.beginPath();
    ctxColor.fillStyle = styleDraw;
    ctxColor.arc(24, 24, 24, 0, Math.PI*2, false);
    ctxColor.fill();
  }

  $("#DrawJS").on("mousedown", caDown);
  $("#DrawJS").on("mouseup", caUp);
  $("#DrawJS").on({mousedown: function(e){ return false; }});

  // Wallpaper API
  window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
      
      // Read custom boolean
      if (properties.custombool) {
        if (properties.custombool.value) {
          $(".DrawTools").show();
        }
        else if (!properties.custombool.value) {
          $(".DrawTools").hide();
        }
      }

      // Read single selected image
      if (properties.customimage) {
        imgCanvas.src = 'file:///' + properties.customimage.value;
        imgCanvas.onload = function() {
          ctxDraw.drawImage(imgCanvas, 0, 0, window.screen.width, window.screen.height);
        }
      }

    }
  };
});
