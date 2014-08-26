
$.provide('$.ui.Card');

$.ui.Card = function() {
	$.ui.Component.call(this);

	this.targets_ = [];
};
$.inherits($.ui.Card, $.ui.Component);

$.ui.Card.prototype.visible_ = null;
$.ui.Card.prototype.targets_ = null;
$.ui.Card.prototype.contentElement_ = null;
$.ui.Card.prototype.offsetTop_ = 0;
$.ui.Card.prototype.offsetLeft_ = 0;

$.ui.Card.prototype.setPositionOffset = function(offsetLeft, offsetTop) {
	this.offsetLeft_ = offsetLeft;
	this.offsetTop_ = offsetTop;
};

$.ui.Card.prototype.attachTargets = function(targets) {
	if(targets.length) {
		for(var i = 0, l = targets.length; i < l; i++) {
			var target = targets[i];
			if($.inArray(target, this.targets_) == -1) {
				this.targets_.push(target);
				this.bindTargetEvents(target);
			}
		}
	}

	if(!this.getElement()) {
		this.createDom();
		this.getElement().appendTo("body");
	}
	this.bindEvents_();
};

$.ui.Card.prototype.bindTargetEvents = function(target) {
	if(target) {
		$.listen(target, "mouseenter", this.handleMouseEnter, this);
		$.listen(target, "mouseleave", this.handleMouseLeave, this);
	}
};

$.ui.Card.prototype.unbindTargetEvents = function(target) {
	if(target) {
		$.unlisten(target, "mouseenter", this.handleMouseEnter, this);
		$.unlisten(target, "mouseleave", this.handleMouseLeave, this);
	}
};


$.ui.Card.prototype.detachTargets = function(targets) {
	if(targets.length && this.targets_.length) {
		for(var i = 0, l = targets.length; i < l; i++) {
			var target = targets[i];
			var index = $.inArray(target, this.targets_);
			if(index > -1) {
				this.targets_.splice(index, 1);
				this.unbindTargetEvents(target);
			}
		}
	}
};

$.ui.Card.prototype.detachAllTargets = function() {
	this.detachTargets(this.targets_);
};

$.ui.Card.prototype.handleMouseEnter = function(e) {
	if($.inArray(e.currentTarget, this.targets_) > -1) {
		var target = $(e.currentTarget);
		var offset = target.offset();
		this.getElement() &&
			this.getElement().css({
				top: offset.top + target.height() + this.offsetTop_,
				left: offset.left + this.offsetLeft_
			});
	}
	this.showTimer_.start();
	this.hideTimer_.stop();
};

$.ui.Card.prototype.handleMouseLeave = function(e) {
	this.hideTimer_.start();
	this.showTimer_.stop();
};

$.ui.Card.prototype.bindEvents_ = function() {
	if(!this.showTimer_) {
		this.showTimer_ = new $.timer.TimeTrigger(this.show, this, 300);
		this.hideTimer_ = new $.timer.TimeTrigger(this.hide, this, 300);
	}
	
	
	if(this.getElement()) {
		this.getElement().listen("mouseenter", this.handleMouseEnter, this);
		this.getElement().listen("mouseleave", this.handleMouseLeave, this);
	}
};

$.ui.Card.prototype.unbindEvents_ = function() {
	this.getElement() && this.getElement().unlisten("mouseenter", this.handleMouseEnter);
	this.getElement() && this.getElement().unlisten("mouseleave", this.handleMouseLeave);
};

$.ui.Component.prototype.getContentElement = function() {
	return this.contentElement_;
};

$.ui.Card.prototype.createDom = function() {
	var elem = $('<div class="tips_common"><div class="diy_triangle diy_triangle_gray"><b class="diy_line diy_1"></b><b class="diy_line diy_2"></b><b class="diy_line diy_3"></b><b class="diy_line diy_4"></b><b class="diy_line diy_5"></b><b class="diy_line diy_6"></b><b class="diy_line diy_7"></b></div></div>');
	elem.css("display", this.visible_ ? "block" : "none");
	var contentElem = $('<div class="tips_common_c"></div>');
	contentElem.appendTo(elem);
	if(this.getContent()) {
		contentElem.html(this.getContent());
	}
	
	this.contentElement_ = contentElem;
	this.setElementInternal(elem);
};

$.ui.Card.prototype.setVisible = function(visible) {
	if(this.visible_ != visible) {
		this.getElement() && this.getElement().css("display", visible ? "block" : "none");
		this.visible_ = visible;
	}
};

$.ui.Card.prototype.show = function() {
	this.setVisible(true);
};

$.ui.Card.prototype.hide = function() {
	this.setVisible(false);
};




