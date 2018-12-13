λ('input[type=\'search\']', self => {
	var timerId;

	self.addEventListener('keyup', () => {
		if (timerId) {
			clearTimeout(timerId);
		}

		timerId = setTimeout(() => fetch('/search/index.json').then(data => data.json().then(json => {
			var fuse = new Fuse(json, {
				keys: [ 'uri', 'title' ]
			});
			console.log(fuse.search(self.value));
		})), 500);
	});
});
