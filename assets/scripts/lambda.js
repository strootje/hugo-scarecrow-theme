(() => {
	'use strict';
	const BuildLambda = function (nodes) {
		const Lambda = function () {
		}

		const each = function (callback) {
			nodes.forEach(node => callback(node));
		}

		const reduce = function (callback) {
			return [...nodes].reduce((prev, cur) => [...prev, ...callback(cur)], []);
		}

		Lambda.prototype.parent = function (query, callback) {
			if (typeof query === 'function') {
				each(node => query(BuildLambda([node.parentNode])));
			} else {
				each(node => document.querySelectorAll(query).forEach(parent => {
					if (parent.contains(node)) {
						callback(BuildLambda([parent]));
					}
				}));
			}
		}

		Lambda.prototype.find = function (query) {
			const children = reduce(node => node.querySelectorAll(query));
			return BuildLambda(children);
		}

		Lambda.prototype.delete = function () {
			each(node => node.parentNode.removeChild(node));
			return null;
		}

		Lambda.prototype.createChild = function (tag) {
			const children = reduce(node => {
				const newChild = document.createElement(tag);
				node.appendChild(newChild);
				return [newChild];
			});

			return BuildLambda(children);
		}




		Lambda.prototype.value = function (callback) {
			each(node => callback(node.value));
			return this;
		}

		Lambda.prototype.text = function (text) {
			each(node => node.innerHTML = text);
			return this;
		}





		Lambda.prototype.addClass = function (className) {
			each(node => node.classList.add(className));
			return this;
		}

		Lambda.prototype.removeClass = function (className) {
			each(node => node.classList.remove(className));
			return this;
		}

		Lambda.prototype.addAttribute = function (name, value) {
			each(node => node[name] = value);
			return this;
		}

		Lambda.prototype.on = function (evt, callback) {
			each(node => node.addEventListener(evt, args => callback(BuildLambda([node]), args)));
		}

		Lambda.prototype.throttle = function (evt, milisec, callback) {
			each(node => {
				let timer;

				node.addEventListener(evt, args => {
					if (timer) { clearTimeout(timer); }
					timer = setTimeout(() => callback(BuildLambda([node]), args), milisec);
				})
			});
		}

		Lambda.prototype.emit = function (evt, params) {
			each(node => {
				Object.keys(params).forEach(key => node[key] = params[key]);
				node.dispatchEvent(new Event(evt));
			});
		}

		return new Lambda();
	}

	const Bootstrap = window.Bootstrap = window.$ = (query, callback) => domready(() => {
		callback(BuildLambda(document.querySelectorAll(query)));
	});

	Bootstrap.delay = (timeout, callback) => setTimeout(callback, timeout);
	Bootstrap.json = (url, callback) => fetch(url).then(resp => resp.json().then(json => callback(json)));
})();
