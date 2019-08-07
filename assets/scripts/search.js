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
				{ name: 'summary', weight: .2 },
				{ name: 'kind', weight: .01 }
			]
		});

		p.throttle('keyup', 360, self => {
			const target = document.getElementById(self.dataset.target);

			const lists = target.getElementsByTagName('ul');
			for(var i = 0; i < lists.length; i++) {
				target.removeChild(lists[i]);
			}

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

				const i = document.createElement('i');
				li.appendChild(i);
				i.classList.add('fa-fw', 'fa-lg');

				const a = document.createElement('a');
				li.appendChild(a);
				a.href = result.href;

				const h4 = document.createElement('h4');
				a.appendChild(h4);
				h4.classList.add('title', 'is-5');
				h4.innerHTML = result.title;

				const small = document.createElement('small');
				h4.appendChild(small);
				small.innerHTML = result.href;

				const h6 = document.createElement('h6');
				a.appendChild(h6);
				h6.classList.add('subtitle', 'is-7');
				h6.innerHTML = result.summary;

				switch (result.kind) {
					case 'home':
						i.classList.add('fas', 'fa-home');
						break;

					case 'page':
						i.classList.add('fas', 'fa-newspaper');
						break;

					case 'section':
						i.classList.add('fas', 'fa-list');
						break;

					case 'taxonomy':
						i.classList.add('fas', 'fa-hashtag');
						break;

					case 'taxonomyTerm':
						i.classList.add('fas', 'fa-list');
						break;

					default:
						i.classList.add('fas', 'fa-question');
						break;
				}
			});
		});
	}));
});
