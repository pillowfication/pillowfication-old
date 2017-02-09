/*
 *   A little tool to turn a DOM element into a canvas. Requires jQuery.
 *
 *   Example usage:
 *
 *   Pillow.canvas(document.body, (function() {
 *       // Initial code
 *       var color = "#"+("00000"+((1<<24)*Math.random()|0).toString(16)).slice(-6);
 *       var size = 200;
 *       var theta = 0;
 *
 *       // Loop code
 *       return function(ctx) {
 *           var width = ctx.canvas.width, height = ctx.canvas.height;
 *           var cX = width/2, cY = height/2;
 *           ctx.clearRect(0, 0, width, height);
 *
 *           ctx.fillStyle = color;
 *           ctx.beginPath();
 *           ctx.moveTo(cX + size*Math.cos(theta), cY + size*Math.sin(theta));
 *           ctx.lineTo(cX + size*Math.cos(theta + Math.PI*2/3), cY + size*Math.sin(theta + Math.PI*2/3));
 *           ctx.lineTo(cX + size*Math.cos(theta + Math.PI*4/3), cY + size*Math.sin(theta + Math.PI*4/3));
 *           ctx.closePath();
 *           ctx.fill();
 *
 *           theta += .03;
 *       };
 *   })(), {
 *       // Options
 *       redraw: "always"
 *   });
 */

(function(Pillow, $) {
	"use strict";

	Pillow.canvas = function(elem, draw, options) {

		options = $.extend({
			id: null,
			class: null,
			width: null,
			height: null,
			redraw: "resize", // never, always, resize
			resize: true,
		}, options);

		$(elem).each(function() {

			var $this = $(this).css("overflow", "hidden");
			if (options.width)
				$this.css("width", options.width);
			if (options.height)
				$this.css("height", options.height);

			var canvas = document.createElement("canvas");
			canvas.style.position = "absolute";
			if (options.id)
				canvas.id = options.id;
			if (options.class)
				canvas.className = options.class;
			var context = canvas.getContext("2d");

			function size() {
				canvas.width = $this.innerWidth();
				canvas.height = $this.innerHeight();
			}
			size();
			if (options.resize)
				$(window).resize(size);
			if (options.redraw == "resize")
				$(window).resize(function() {
					draw(context);
				});

			if (options.redraw == "always")
				(function run() {
					draw(context);
					requestAnimationFrame(run);
				})();
			else
				draw(context);

			$this.on("draw", function() {
				draw(context);
			});

			$this.prepend(canvas);

		});

	};

// Fix for things using $(...).pillowcanvas()
$.fn.extend({
  pillowcanvas: function(draw, options) {
    return Pillow.canvas(this, draw, options);
  }
});

})(window.Pillow = window.Pillow || {}, jQuery);
