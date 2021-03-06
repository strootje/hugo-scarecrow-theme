(() => { 'use strict';
	const BuildLambda = function( nodes ) {
		const Lambda = function() {
		}

		Lambda.prototype.each = function(cb) {
			nodes.forEach(cb);
		}

		Lambda.prototype.on = function(evt, cb) {
			this.each(node => node.addEventListener(evt, args => cb(node, args)));
		}

		Lambda.prototype.throttle = function(evt, milisec, cb) {
			this.each(node => {
				let timer;

				node.addEventListener(evt, args => {
					if (timer) { clearTimeout(timer); }
					timer = setTimeout(() => cb(node, args), milisec);
				})
			});
		}

		return new Lambda();
	}

	const Bootstrap = window.Bootstrap = window.$ = ( query, callback ) =>
		document.addEventListener('DOMContentLoaded', () => callback(BuildLambda(
			document.querySelectorAll(query)
		))
	);
})();
