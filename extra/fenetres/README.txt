A Pen created at CodePen.io. You can find this one at http://codepen.io/bali_balo/pen/yJOmgv.

 Try dragging to rotate manually ! Quite slow, works best in Chrome.

So yeah, this is a lot of code.

This project changed a lot since the initial idea. It was supposed to be 6 canvas on a cube animated via CSS, with transformation applied to cancel the CSS one and draw as if it was flat. It turns out it was too complicated for me because I didn't get correct results (maybe I didn't try hard enough).  
Anyway, in the end, after changing techniques multiple times (using an actual DOM element and getComputedStyle, ...) I decided to go full js/canvas.

It was pretty tough thinking of animations giving correct results.  
The one that took me the most time is "Physics", as I started trying to implement actual object collision (I wanted to put a bunch of small boxes), but it got really long/complex, so I went for a simpler version.  
For the one I did last, I ran out of ideas, so I implemented my CSS pen [Growing boxes](http://codepen.io/bali_balo/pen/XbyrME?editors=1100) in js.

If you want to play with this code, code folding will be really useful !