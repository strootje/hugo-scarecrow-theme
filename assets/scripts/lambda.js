const lambda = window.$ = function $(selector) {
	return bonzo(qwery(selector));
}

$.ready = domready;
