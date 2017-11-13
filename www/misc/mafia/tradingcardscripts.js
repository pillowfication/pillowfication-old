function createCard(type, data) {
	var $elemCard = elementClass("div", "card "+type).attr("id", data.name);
	if (data.original) $elemCard.addClass("original");
		var $elemCardFront = elementClass("div", "front");
			var $elemName = elementClass("div", "name").html(data.name);
			var $elemImage = elementClass("div", "image").css("background-image", "url("+data.image+")");
			var $elemText = elementClass("div", "text");
				var $elemAbility = elementClass("div", "ability").html(data.ability);
				var $elemFlavour = elementClass("div", "flavour").html(data.flavour);
			$elemText.append($elemAbility).append($elemFlavour);
		$elemCardFront.append($elemName).append($elemImage).append($elemText);
		var $elemCardBack = elementClass("div", "back");
	$elemCard.append($elemCardFront).append($elemCardBack);

	return $elemCard;
}
(function($) {
	$.fn.flip = function() {
		$(this).toggleClass("flipped");
	}
	$.fn.handleDrag = function() {
		return $(this).addClass("draggableContainer").on("mousemove", function(e) {
			$drag = $(".dragging").eq(0);
			$drag.offset({
				top: e.pageY+parseInt($drag.attr("data-posY")), left: e.pageX+parseInt($drag.attr("data-posX"))
			});
		}).on("mouseup", function() {
			$drag.removeClass("dragging");
		});
	}
	$.fn.draggable = function() {
		var $this = $(this);
		return $this.on("mousedown", function(e) {
			$this.addClass("dragging");
			$this.attr({"data-posX": $this.offset().left-e.pageX, "data-posY": $this.offset().top-e.pageY});
			e.preventDefault();
		}).on("mouseup", function() {
			$this.removeClass("dragging");
		});
	}
})(jQuery);

function element(tagName) {
	return $(document.createElement(tagName));
}
function elementClass(tagName, className) {
	return element(tagName).addClass(className);
}
