
$.provide("$.ui.Component");

$.ui.Component = function(opt_doc) {
	this.document_ = opt_doc || window.document;
};
$.inherits($.ui.Component, $.event.EventTarget);

$.ui.Component.prototype.id_ = null;
$.ui.Component.prototype.element_ = null;
$.ui.Component.prototype.inDocument_ = false;
$.ui.Component.prototype.children_ = null;
$.ui.Component.prototype.childIndex_ = null;
$.ui.Component.prototype.allowTextSelection_ = false;
$.ui.Component.prototype.state_ = 0x00;
$.ui.Component.prototype.document_ = null;
$.ui.Component.prototype.content_ = null;
$.ui.Component.prototype.visible_ = true;

$.ui.Component.EventType = {
	BEFORE_SHOW: 'beforeshow',
	SHOW: 'show',
	HIDE: 'hide',
	DISABLE: 'disable',
	ENABLE: 'enable',
	HIGHLIGHT: 'highlight',
	UNHIGHLIGHT: 'unhighlight',
	ACTIVATE: 'activate',
	DEACTIVATE: 'deactivate',
	SELECT: 'select',
	UNSELECT: 'unselect',
	CHECK: 'check',
	UNCHECK: 'uncheck',
	FOCUS: 'focus',
	BLUR: 'blur',
	OPEN: 'open',
	CLOSE: 'close',
	ENTER: 'enter',
	LEAVE: 'leave',
	ACTION: 'action',
	CHANGE: 'change'
};

$.ui.Component.prototype.createElement = function(html) {
	return $(html, this.document_);
};

$.ui.Component.prototype.createDom = function() {
	this.element_ = this.createElement("<div>");
};

$.ui.Component.prototype.setElementInternal = function(element) {
	this.element_ = element;
};

$.ui.Component.prototype.getContent = function(content) {
	return this.content_;
};

$.ui.Component.prototype.setContent = function(content) {
	this.content_ = content;
	this.setContentInternal(content);
};

$.ui.Component.prototype.setContentInternal = function(content) {
	var elem = this.getContentElement();
	elem && elem.html(content);
};

$.ui.Component.State = {
	ALL: 0xFF,
	DISABLED: 0x01,
	HOVER: 0x02,
	ACTIVE: 0x04,
	SELECTED: 0x08,
	CHECKED: 0x10,
	FOCUSED: 0x20,
	OPENED: 0x40
};


$.ui.Component.prototype.hasState = function(state) {
	return !!(this.state_ & state);
};

$.ui.Component.prototype.setState = function(state, enable) {
	this.state_ = enable ? this.state_ | state : this.state_ & ~state;
};

$.ui.Component.prototype.getId = function() {
	return this.id_ || (this.id_ = ':' + ($.guid++));
};

$.ui.Component.prototype.setId = function(id) {
	if (this.parent_ && this.parent_.childIndex_) {
		$.object.remove(this.parent_.childIndex_, this.id_);
		$.object.add(this.parent_.childIndex_, id, this);
	}
	this.id_ = id;
};

$.ui.Component.prototype.getElement = function() {
	return this.element_;
};

$.ui.Component.prototype.getContentElement = function() {
	return this.element_;
};

$.ui.Component.prototype.enterDocument = function() {
	this.inDocument_ = true;
	
	this.forEachChild(function(i, child) {
		if (!child.isInDocument() && child.getElement()) {
			child.enterDocument();
		}
	});
};

$.ui.Component.prototype.exitDocument = function() {
	this.inDocument_ = false;
	
	this.forEachChild(function(i, child) {
		if (child.isInDocument()) {
			child.exitDocument();
		}
	});
};

$.ui.Component.prototype.isInDocument = function() {
	return this.inDocument_;
};

$.ui.Component.prototype.isAllowTextSelection = function() {
	return this.allowTextSelection_;
};

$.ui.Component.prototype.setAllowTextSelection = function(allow) {
	this.allowTextSelection_ = allow;
	
	var element = this.getElement();
	if (element) {
		element.setUnselectable(allow);
	}
};

$.ui.Component.prototype.render = function(opt_parentElement) {
	this.render_(opt_parentElement);
};
$.ui.Component.prototype.renderBefore = function(siblingElement) {
	this.render_(siblingElement.parentNode || siblingElement.parent(), siblingElement);
};

$.ui.Component.prototype.render_ = function(opt_parentElement, opt_beforeElement) {
	if (this.inDocument_) {
		throw Error('ALREADY_RENDERED');
	}
	
	if (!this.element_) {
		this.createDom();
	}
	
	if(this.element_.jquery) {
		if (opt_beforeElement) {
			this.element_.insertBefore(opt_beforeElement);
		} else if (opt_parentElement) {
			this.element_.appendTo(opt_parentElement);
		} else {
			this.element_.appendTo('body');
		}
	} else {
		if (opt_parentElement) {
			opt_parentElement.insertBefore(this.element_, opt_beforeElement || null);
		} else {
			document.body.appendChild(this.element_);
		}
	}
	
	
	if(!this.parent_ || this.parent_.isInDocument()) {
		this.enterDocument();
	}
};

$.ui.Component.prototype.createDom = function() {
	this.element_ = $('<div>');
};

$.ui.Component.prototype.setParent = function(parent) {
	this.parent_ = parent;
	$.ui.Component.superClass_.setParentEventTarget.call(this, parent);
};

$.ui.Component.prototype.getParent = function() {
	return this.parent_;
};

$.ui.Component.prototype.addChild = function(child, opt_render) {
	this.addChildAt(child, this.getChildCount(), opt_render);
};

$.ui.Component.prototype.getChildCount = function() {
	return this.children_ ? this.children_.length : 0;
};

$.ui.Component.prototype.indexOfChild = function(child) {
	return (this.children_ && child) ? $.array.indexOf(this.children_, child) :
		-1;
};

$.ui.Component.prototype.addChildAt = function(child, index, opt_render) {
	if (child.inDocument_ && (opt_render || !this.inDocument_)) {
		throw Error('ALREADY_RENDERED');
	}
	if (index < 0 || index > this.getChildCount()) {
		throw Error('CHILD_INDEX_OUT_OF_BOUNDS');
	}
	
	// Create the index and the child array on first use.
	if (!this.childIndex_ || !this.children_) {
		this.childIndex_ = {};
		this.children_ = [];
	}
	
	// Moving child within component, remove old reference.
	if (child.getParent() == this) {
		$.object.set(this.childIndex_, child.getId(), child);
		$.array.remove(this.children_, child);
	} else {
		$.object.add(this.childIndex_, child.getId(), child);
	}
	
	child.setParent(this);
	$.array.insertAt(this.children_, child, index);
	
	if (child.inDocument_ && this.inDocument_) {
		var contentElement = this.getContentElement();
		contentElement.insertBefore(child.getElement(),
			(this.getChildAt(index).getElement() || null));
		/*var sibling = this.getChildAt(index + 1);
		
		if (sibling) {
			sibling.getElement().before(child.getElement());
		} else {
			this.getContentElement().append(child.getElement());
		}*/
	} else if (opt_render) {
		if (!this.element_) {
			this.createDom();
		}
		this.renderChildAt(child, index);
	} else {
		if (this.inDocument_ && !child.inDocument_ && child.getElement()) {
			child.enterDocument();
		}
	}
};

$.ui.Component.prototype.renderChildAt = function(child, index) {
	var sibling = this.getChildAt(index + 1);
	child.render_(this.getContentElement(), sibling ? sibling.getElement() : null);
};

$.ui.Component.prototype.removeChild = function(child) {
	if(child) {
		$.object.remove(this.childIndex_, child.getId());
		$.array.remove(this.children_, child);
		
		child.exitDocument();
		child.setParent(null);
		var elem = child.getElement();
		if(elem) {
			if(elem.remove)
				elem.remove();
			else
				elem.parentNode && elem.parentNode.removeChild(elem);
		}
	}
};

$.ui.Component.prototype.getChildAt = function(index) {
	return this.children_ ? this.children_[index] || null : null;
};

$.ui.Component.prototype.getChild = function(id) {
  return (this.childIndex_ && id) ? this.childIndex_[id] || null : null;
};


$.ui.Component.prototype.removeChildAt = function(index) {
	return this.removeChild(this.getChildAt(index));
};
$.ui.Component.prototype.hasChildren = function() {
	return !!this.children_ && this.children_.length != 0;
};
$.ui.Component.prototype.removeChildren = function(opt_unrender) {
	while (this.hasChildren()) {
		this.removeChildAt(0);
	}
};
$.ui.Component.prototype.forEachChild = function(fn, opt_this) {
	var this_ = opt_this || this;
	if (this.children_) {
		for(var i = 0, l = this.children_.length; i < l; i++) {
			fn.call(this_, i, this.children_[i]);
		}
	}
};

$.ui.Component.prototype.setVisible = function(visible) {
	this.visible_ = visible;
};

$.ui.Component.prototype.isVisible = function() {
	return this.visible_;
};

$.ui.Component.prototype.disposeInternal = function() {
	$.ui.Component.superClass_.disposeInternal.call(this);
	
	if (this.inDocument_) {
		this.exitDocument();
	}
	
	// Disposes of the component's children, if any.
	this.forEachChild(function(i, child) {
		child.dispose();
	});
	
	// Detach the component's element from the DOM, unless it was decorated.
	if (this.element_) {
		(this.element_.remove && this.element_.remove()) ||
		(this.element_.parentNode && this.element_.parentNode.removeChild(this.element_));
	}
	
	this.children_ = null;
	this.childIndex_ = null;
	this.element_ = null;
	this.parent_ = null;
	// TODO(user): delete this.dom_ breaks many unit tests.
};






