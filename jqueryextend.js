/**
 * 适用jquery1.7.2
 */
(function(jQuery){
    var quickIs = function(elem, m) {
        var attrs = elem.attributes || {};
        return (
            (!m[1] || elem.nodeName.toLowerCase() === m[1]) && (!m[2] || (attrs.id || {}).value === m[2]) && (!m[3] || m[3].test((attrs["class"] || {}).value)));
    };
    
    jQuery.event.dispatch = jQuery.event.handle = function(event) {

    // Make a writable jQuery.Event from the native event object
    event = jQuery.event.fix(event || window.event);

    var handlers = ((jQuery._data(this, "events") || {})[event.type] || []),
        delegateCount = handlers.delegateCount,
        args = [].slice.call(arguments, 0),
        run_all = !event.exclusive && !event.namespace,
        special = jQuery.event.special[event.type] || {},
        handlerQueue = [],
        i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

    // Use the fix-ed jQuery.Event rather than the (read-only) native event
    args[0] = event;
    event.delegateTarget = this;

    // Call the preDispatch hook for the mapped type, and let it bail if desired
    if(special.preDispatch && special.preDispatch.call(this, event) === false) {
        return;
    }

    // Determine handlers that should run if there are delegated events
    // Avoid non-left-click bubbling in Firefox (#3861)
    if(delegateCount && !(event.button && event.type === "click")) {

        // Pregenerate a single jQuery object for reuse with .is()
        jqcur = jQuery(this);
        jqcur.context = this.ownerDocument || this;

        for(cur = event.target; cur != this; cur = cur.parentNode || this) {

            // Don't process events on disabled elements (#6911, #8165)
            if(cur.disabled !== true) {
                selMatch = {};
                matches = [];
                jqcur[0] = cur;
                for(i = 0; i < delegateCount; i++) {
                    handleObj = handlers[i];
                    sel = handleObj.selector;

                    if(selMatch[sel] === undefined) {
                        selMatch[sel] = (
                        handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel));
                    }
                    if(selMatch[sel]) {
                        matches.push(handleObj);
                    }
                }
                if(matches.length) {
                    handlerQueue.push({
                        elem: cur,
                        matches: matches
                    });
                }
            }
        }
    }

    // Add the remaining (directly-bound) handlers
    if(handlers.length > delegateCount) {
        handlerQueue.push({
            elem: this,
            matches: handlers.slice(delegateCount)
        });
    }

    // Run delegates first; they may want to stop propagation beneath us
    for(i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
        matched = handlerQueue[i];
        event.currentTarget = matched.elem;

        for(j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
            handleObj = matched.matches[j];

            // Triggered event must either 1) be non-exclusive and have no namespace, or
            // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
            if(run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {

                event.data = handleObj.data;
                event.handleObj = handleObj;



                ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(handleObj.callObj || matched.elem, args);
                if(handleObj.callOnce) {
                    $.event.remove(this, event.type, handleObj.handler);
                }

                if(ret !== undefined) {
                    event.result = ret;
                    if(ret === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        }
    }

    // Call the postDispatch hook for the mapped type
    if(special.postDispatch) {
        special.postDispatch.call(this, event);
    }

    return event.result;
};

$.support.transition = (function(){ 
    var thisBody = document.body || document.documentElement,
    thisStyle = thisBody.style,
    support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
                  
    return support; 
})();

jQuery.each({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
}, function(orig, fix) {
    jQuery.event.special[orig] = {
        delegateType: fix,
        bindType: fix,

        handle: function(event) {
            var target = event.currentTarget,
                related = event.relatedTarget,
                handleObj = event.handleObj,
                selector = handleObj.selector,
                ret;

            // For mousenter/leave call the handler if related is outside the target.
            // NB: No relatedTarget if the mouse left/entered the browser window
            if (!related || (related !== target && !jQuery.contains(target, related))) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply(handleObj.callObj || this, arguments);
                event.type = fix;
            }
            return ret;
        }
    };
});

$.now = (function() {
	return +new Date();
});
$.isNumber = $.isNumeric;
$.isObject = function(val) {
	var type = typeof val;
	return type == 'object' && val != null || type == 'function';
};
$.isString = function(val) {
	return $.type(val) == "string";
};


$.event.Event = $.Event;

$.event.listen = $.listen = function(src, type, fn, opt_handler) {
    var f = $.event.getListener(fn, opt_handler);
    $.event.add(src, type, f);
};

$.event.getListener = function(fn, opt_callObj) {
    var ret = {
        handler: fn,
        callObj: opt_callObj,
        callOnce: false,
        data: {}
    };
    return ret;
};

$.event.listenOnce = $.listenOnce = function(src, type, fn, opt_handler) {
    var f = $.event.getListener(fn, opt_handler);
    f.callOnce = true;
    $.event.add(src, type, f);
};

$.fn.listen = function(type, fn, opt_handler, opt_data) {
    var f = $.event.getListener(fn, opt_handler);
    this.bind(type, opt_data, f);
    return this;
};

$.event.unlisten = $.unlisten = function(src, type, fn, opt_handler) {
    $.event.remove(src, type, fn);
};

$.fn.unlisten = function(type, fn, opt_handler) {
    this.unbind(type, fn);
    return this;
};

$.inherits = function(childCtor, parentCtor) {
    function tempCtor() {};
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;
};

$.provide = function(name) {
    var parts = name.split('.');
    var cur = window;
    for (var part; parts.length && (part = parts.shift());) {
        if (cur[part]) {
            cur = cur[part];
        } else {
            cur = cur[part] = {};
        }
    }
};

$.addSingletonGetter = function(constructer) {
    constructer.getInstance = function() {
        return constructer.instance_ || (constructer.instance_ = new constructer());
    }
    constructer.instance_ = null;
};

$.htmlEscape = function(str) {
    return str.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\"/g, '&quot;');
};

$.string = {};
$.string.htmlEscape = $.htmlEscape;
$.string.getUrlData = function(str, key) {
    str = decodeURIComponent(str);
    var reg = new RegExp(key + "\\=([^\\&]*)");
    var matches = str.match(reg);
    return (matches && matches[1]) || '';
};

$.string.searchStringToObject = function(string) {
    var ret = {};
    var params = string.split("&");
    for(var param, i = 0, l = params.length; i < l; i++) {
        param = params[i].split("=");
        param[1] && (ret[decodeURIComponent(param[0])] = decodeURIComponent(param[1]));
    }
    return ret;
};

$.string.unescapePureXmlEntities = function(str) {
    return str.replace(/&([^;]+);/g, function(s, entity) {
        switch (entity) {
            case 'amp':
                return '&';
            case 'lt':
                return '<';
            case 'gt':
                return '>';
            case 'quot':
                return '"';
            default:
                if (entity.charAt(0) == '#') {
                    // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
                    var n = Number('0' + entity.substr(1));
                    if (!isNaN(n)) {
                        return String.fromCharCode(n);
                    }
                }
                // For invalid entities we just return the entity
                return s;
        }
    });
};

$.string.repeat = function(string, length) {
	return new Array(length + 1).join(string);
};


$.string.padNumber = function(num, length, opt_precision) {
	var s = $.type(opt_precision) != "undefined" ? num.toFixed(opt_precision) : String(num);
	var index = s.indexOf('.');
	if (index == -1) {
		index = s.length;
	}
	return $.string.repeat('0', Math.max(0, length - index)) + s;
};

//$.ui.Component 用到
$.getCssName = function(classPre, name) {
	return classPre + "-" + name;
};

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

if(typeof JSON !== 'object') {
    JSON = {};
}

(function() {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if(typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function(key) {

            return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = { // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].
        var i, // The loop counter.
        k, // The member key.
        v, // The member value.
        length, mind = gap,
            partial, value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.
        if(value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.
        if(typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.
        switch(typeof value) {
        case 'string':
            return quote(value);

        case 'number':

            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.
            return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.
        case 'object':

            // Due to a specification blunder in ECMAScript, typeof null is 'object',
            // so watch out for that case.
            if(!value) {
                return 'null';
            }

            // Make an array to hold the partial results of stringifying this object value.
            gap += indent;
            partial = [];

            // Is the value an array?
            if(Object.prototype.toString.apply(value) === '[object Array]') {

                // The value is an array. Stringify every element. Use null as a placeholder
                // for non-JSON values.
                length = value.length;
                for(i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

                // Join all of the elements together, separated with commas, and wrap them in
                // brackets.
                v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

            // If the replacer is an array, use it to select the members to be stringified.
            if(rep && typeof rep === 'object') {
                length = rep.length;
                for(i = 0; i < length; i += 1) {
                    if(typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if(v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

                // Otherwise, iterate through all of the keys in the object.
                for(k in value) {
                    if(Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if(v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            // Join all of the member texts together, separated with commas,
            // and wrap them in braces.
            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.
    if(typeof JSON.stringify !== 'function') {
        JSON.stringify = function(value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.
            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.
            if(typeof space === 'number') {
                for(i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.
            } else if(typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.
            rep = replacer;
            if(replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.
            return str('', {
                '': value
            });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.
    if(typeof JSON.parse !== 'function') {
        JSON.parse = function(text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.
            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.
                var k, v, value = holder[key];
                if(value && typeof value === 'object') {
                    for(k in value) {
                        if(Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if(v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.
            text = String(text);
            cx.lastIndex = 0;
            if(cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.
            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
            if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.
                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.
                return typeof reviver === 'function' ? walk({
                    '': j
                }, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.
            throw new SyntaxError('JSON.parse');
        };
    }
}());

$.provide("$.array");

$.array.indexOf = function(arr, obj) {
	return $.inArray(obj, arr);
};

$.array.splice = function(arr, index) {
	return arr.splice(index, 1);
};

$.array.remove = function(arr, obj) {
	var i = $.inArray(obj, arr);
	var rv;
	if ((rv = i >= 0)) {
		arr.splice(i, 1);
	}
	//alert(arr.length);
	return rv;
};

$.array.clear = function(arr) {
	if (!$.isArray(arr)) {
		for (var i = arr.length - 1; i >= 0; i--) {
			delete arr[i];
		}
	}
	arr.length = 0;
};

$.array.clone = function(arr) {
	if ($.isArray(arr)) {
		return arr.concat([]);
	} else { // array like
		// Concat does not work with non arrays.
		var rv = [];
		for (var i = 0, len = arr.length; i < len; i++) {
			rv[i] = arr[i];
		}
		return rv;
	}
};

$.array.equals = function(arr1, arr2) {
	if(!arr1 || !arr2 || arr1.length != arr2.length) {
		return false;
	}
	var l = arr1.length;
	while(l--) {
		if(arr1[l] != arr2[l])
			return false;
	}
	return true;
};

$.array.diff = function(arr1, arr2) {
	var arr = [];
	var i = 0, obj;
	while(obj = arr1[i]) {
		if($.inArray(obj, arr2)) {
			
		} else {
			arr.push(obj);
		}
		i++;
	}
	i = 0;
	while(obj = arr2[i]) {
		if($.inArray(obj, arr1)) {
			
		} else {
			arr.push(obj);
		}
		i++;
	}
	
	return arr;
};

$.array.differentiate = function(array1, array2) {
	var array = $.array.clone(array1), i = 0, u, key;
	while(u = array2[i]) {
		key = $.array.indexOf(u);
		if(key > -1) {
			array.splice(key, 1);
		} else {
			array.push(u);
		}
		i++;
	}
	
	return array;
};

$.array.insertAt = function(arr, obj, i) {
	arr.splice(i, 0, obj);
};
$.array.concat = function(var_args) {
	return Array.prototype.concat.apply(
		Array.prototype, arguments);
};

$.provide("$.object");

$.object.remove = function(obj, key) {
	var rv;
	if ((rv = key in obj)) {
		delete obj[key];
	}
	return rv;
};

$.object.add = function(obj, key, val) {
	if (key in obj) {
		throw 'The object already contains the key "' + key + '"';
	}
	$.object.set(obj, key, val);
};

$.object.get = function(obj, key, opt_val) {
	if (key in obj) {
		return obj[key];
	}
	return opt_val;
};

$.object.set = function(obj, key, value) {
	obj[key] = value;
};

$.object.transpose = function(obj) {
	var transposed = {};
	for (var key in obj) {
		transposed[obj[key]] = key;
	}
	return transposed;
};
$.object.clone = function(obj) {
	var res = {};
	for (var key in obj) {
		res[key] = obj[key];
	}
	return res;
};

if(!window.console) {
    window.console = {};
    window.console.log = function() {};
};
})(jQuery);