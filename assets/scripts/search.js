$('input[type=\'search\']', p => {
	p.throttle('blur', 360, self => {
		const target = document.getElementById(self.dataset.target);
		target.classList.remove('is-active');
	});

	fetch('/search/index.json').then(resp => resp.json().then(json => {
		const fuse = new Fuse(json.data, {
			keys: [
				{ name: 'title', weight: .5 },
				{ name: 'href', weight: .7 },
				{ name: 'content', weight: .2 }
			]
		});

		p.throttle('keyup', 360, self => {
			const target = document.getElementById(self.dataset.target);

			target.removeChild(target.firstElementChild);
			const ul = document.createElement('ul');
			target.appendChild(ul);

			if (self.value == '') {
				return;
			}

			target.classList.add('is-active');

			const results = fuse.search(self.value);
			results.forEach(result => {
				const li = document.createElement('li');
				ul.appendChild(li);

				const a = document.createElement('a');
				li.appendChild(a);
				a.href = result.href;
				a.innerText = result.title;
			});
		});
	}));
});
