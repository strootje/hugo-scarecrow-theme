(() => { 'use strict';
	const lambda = window.lambda = window.λ = ( query, callback ) =>
		document.addEventListener('DOMContentLoaded', () =>
			document.querySelectorAll(query).forEach(callback));
})();
