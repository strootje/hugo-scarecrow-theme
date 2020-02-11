fetch('/search/index.json').then(resp => resp.json().then(json => {
	const fuse = new Fuse(json.data, {
		keys: [
			{ name: 'title', weight: .5 },
			{ name: 'href', weight: .7 },
			{ name: 'summary', weight: .2 },
			{ name: 'kind', weight: .01 }
		]
	});

	const clear = function(list) {
		while(list.lastChild) {
			list.removeChild(list.lastChild);
		}
	}

	const add = function(list, item) {
		const li = document.createElement('li');
		list.appendChild(li);
		li.classList.add(`is-${item.kind}`);

		const a = document.createElement('a');
		li.appendChild(a);
		a.href = item.href;
		a.innerText = item.title
	}

	const addSearching = function(list) {
		add(list, {
			title: '{{- T "test" | default "searching" -}}',
			kind: 'searching'
		});
	}

	const addEmptySearch = function(list) {
		add(list, {
			title: '{{- T "test" | default "empty search box" -}}',
			kind: 'empty-search'
		});
	}

	const addNoResults = function(list) {
		add(list, {
			title: '{{- T "test" | default "no result" -}}',
			kind: 'no-results'
		});
	}

	$('input[type="search"]', p => {
		p.parent().each(parent => {
			// TODO: remove
			parent.classList.add('is-open');

			parent.classList.remove('is-hidden');
			parent.removeAttribute('aria-hidden');
		});

		p.throttle('blur', 360, node => {
			const target = document.getElementById(node.dataset.target);
			target.classList.remove('is-open');
		});

		p.throttle('keyup', 360, node => {
			const target = document.getElementById(node.dataset.target);
			target.classList.add('is-open');

			const list = document.getElementById('search-results');
			clear(list);

			if (node.value == '') {
				addEmptySearch(list);
				return;
			} else {
				addSearching(list);
			}

			const results = fuse.search(node.value);
			setTimeout(() => {
				clear(list);

				if (!results.data || results.data.length <= 0) {
					addNoResults(list);
				} else {

				}
			}, 1000);
		});
	});
}));

// $('input[type=\'search\']', p => {
// 	p.throttle('blur', 360, self => {
// 		const target = document.getElementById(self.dataset.target);
// 		target.classList.remove('is-active');
// 	});

// 	fetch('/search/index.json').then(resp => resp.json().then(json => {
// 		const fuse = new Fuse(json.data, {
// 			keys: [
// 				{ name: 'title', weight: .5 },
// 				{ name: 'href', weight: .7 },
// 				{ name: 'summary', weight: .2 },
// 				{ name: 'kind', weight: .01 }
// 			]
// 		});

// 		p.throttle('keyup', 360, self => {
// 			const target = document.getElementById(self.dataset.target);

// 			const lists = target.getElementsByTagName('ul');
// 			for(var i = 0; i < lists.length; i++) {
// 				target.removeChild(lists[i]);
// 			}

// 			const ul = document.createElement('ul');
// 			target.appendChild(ul);

// 			if (self.value == '') {
// 				return;
// 			}

// 			target.classList.add('is-active');

// 			const results = fuse.search(self.value);
// 			results.forEach(result => {
// 				const li = document.createElement('li');
// 				ul.appendChild(li);

// 				const i = document.createElement('i');
// 				li.appendChild(i);
// 				i.classList.add('fa-fw', 'fa-lg');

// 				const a = document.createElement('a');
// 				li.appendChild(a);
// 				a.href = result.href;

// 				const h4 = document.createElement('h4');
// 				a.appendChild(h4);
// 				h4.classList.add('title', 'is-5');
// 				h4.innerHTML = result.title;

// 				const small = document.createElement('small');
// 				h4.appendChild(small);
// 				small.innerHTML = result.href;

// 				const h6 = document.createElement('h6');
// 				a.appendChild(h6);
// 				h6.classList.add('subtitle', 'is-7');
// 				h6.innerHTML = result.summary;

// 				switch (result.kind) {
// 					case 'home':
// 						i.classList.add('fas', 'fa-home');
// 						break;

// 					case 'page':
// 						i.classList.add('fas', 'fa-newspaper');
// 						break;

// 					case 'section':
// 						i.classList.add('fas', 'fa-list');
// 						break;

// 					case 'taxonomy':
// 						i.classList.add('fas', 'fa-hashtag');
// 						break;

// 					case 'taxonomyTerm':
// 						i.classList.add('fas', 'fa-list');
// 						break;

// 					default:
// 						i.classList.add('fas', 'fa-question');
// 						break;
// 				}
// 			});
// 		});
// 	}));
// });
