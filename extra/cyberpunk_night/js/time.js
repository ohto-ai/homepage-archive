   var x = window.innerWidth ;
	     var y = window.innerHeight;
	     var c = document.getElementById("myCanvas");
	    c.width = window.innerWidth ,c.height = window.innerHeight;
	    window.onload  = function(){
		document.getElementById("imgif").src="img/background.png";
		Rm = document.querySelector("#imgif");
		Rm.width = window.innerWidth , Rm.height = window.innerHeight;
		
		 var ftop = c.height/1.815;
		 var fleft = c.width/1.967;
		 var ftop2 = c.height/1.815;
		 var fleft2 = c.width/2.031;
		
		setInterval(function(){
		   var date= new Date();
		     var timeimg = new Image();
			var timeminutes = {minutes: date.getMinutes()}
		     timeimg.src = 'img/time.png'; 
			 var cxt = c.getContext("2d");
			 timeimg.onload = function(){
	       cxt.drawImage(timeimg,0,0,x,y);
	       cxt.save();
	       cxt.font = c.width/128+"px Arial";
	       cxt.textBaseline = 'middle';
	       cxt.textAlign = 'center';
	       cxt.fillStyle="#ffffff";
		   if (date.getMinutes()<10) {
		   	 cxt.fillText("0"+date.getMinutes(),fleft,ftop);
			 				
		   } else{
		   	  cxt.fillText(date.getMinutes(),fleft,ftop);
			  				
		   }
	    
		if (date.getHours()<10) {
			 cxt.fillText("0"+date.getHours(),fleft2,ftop2);
		} else{
			  cxt.fillText(date.getHours(),fleft2,ftop2);
		}
		 
		   }
		   Object.defineProperty(timeminutes,'minutes',{
			  set: function(value) {
				  minutes = value;
				  cxt.clearRect(0,0,x,y);	
			  }
			   })
		 
		},1000)
	}
	