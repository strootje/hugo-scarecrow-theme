(() => {
	'use strict';
	const BuildLambda = function (nodes) {
		const Lambda = function () {
			each(node => {
				if (node.classList.contains('is-hidden-if-noscript')) {
					node.classList.remove('is-hidden-if-noscript');
					node.removeAttribute('aria-hidden');
				}
			});
		}

		const each = function (cb) {
			nodes.forEach(node => cb(node));
		}

		Lambda.prototype.each = function (cb) {
			each(node => cb(BuildLambda([node])));
		}

		Lambda.prototype.parent = function (callback) {
			each(node => callback(BuildLambda([node.parentNode])));
		}

		Lambda.prototype.find = function (query, callback) {
			each(node => callback(BuildLambda(node.querySelectorAll(query))));
		}

		Lambda.prototype.value = function (callback) {
			each(node => callback(node.value));
		}

		Lambda.prototype.text = function (text) {
			each(node => node.innerHTML = text);
		}

		Lambda.prototype.createChild = function (name, callback) {
			each(node => {
				const child = document.createElement(name);
				node.appendChild(child);
				callback(BuildLambda([child]));
			});
		}

		Lambda.prototype.show = function () {
			this.removeClass('is-hidden');
			each(node => node.removeAttribute('aria-hidden'));
		}

		Lambda.prototype.hide = function () {
			this.addClass('is-hidden');
			each(node => node.setAttribute('aria-hidden', 'true'));
		}

		Lambda.prototype.addClass = function (className) {
			each(node => node.classList.add(className));
		}

		Lambda.prototype.removeClass = function (className) {
			each(node => node.classList.remove(className));
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

	const Bootstrap = window.Bootstrap = window.$ = (query, callback) => {
		if (document.readyState !== 'loading') {
			callback(BuildLambda(document.querySelectorAll(query)));
		} else {
			document.addEventListener('DOMContentLoaded', () => callback(BuildLambda(
				document.querySelectorAll(query)
			)));
		}
	}
})();
