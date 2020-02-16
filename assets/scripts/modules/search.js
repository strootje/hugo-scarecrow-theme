fetch('/search/index.json').then(resp => resp.json().then(json => {
	const fuse = new Fuse(json.data, {
		keys: [
			{ name: 'title', weight: .5 },
			{ name: 'href', weight: .7 },
			{ name: 'summary', weight: .2 },
			{ name: 'kind', weight: .01 }
		]
	});

	$('input[type="search"]', p => {
		p.on('keydown', node => node.parent(parent => parent.addClass('is-working')));

		p.throttle('keyup', 360, node => {
			node.parent(parent => parent.removeClass('is-working'));

			const list = document.getElementById('search-results');
			clear(list);

			node.value(value => {
				if (value == '') {
					addEmptySearch(list);
					return;
				}

				const results = fuse.search(value);
				if (!results || results.length <= 0) {
					addNoResults(list);
				} else {
					addResults(list, results);
				}
			});
		});
	});

	const clear = function(list) {
		while(list.lastChild) {
			list.removeChild(list.lastChild);
		}
	}

	const add = function(list, item) {
		const li = document.createElement('article');
		list.appendChild(li);
		li.classList.add(`list__item`);
		li.classList.add(`search__item`);
		li.classList.add(`is-${item.kind}`);
		li.classList.add(`has-icon`);

		if (!!item.href) {
			const a = document.createElement('a');
			li.appendChild(a);
			a.classList.add('search__link');
			a.href = item.href;
			a.innerText = item.title;
		} else {
			li.innerText = item.title;
		}
	};

	const addEmptySearch = function(list) {
		add(list, {
			title: '{{- T "test" | default "empty search box" -}}',
			kind: 'empty-search'
		});
	};

	const addNoResults = function(list) {
		add(list, {
			title: '{{- T "test" | default "no result" -}}',
			kind: 'no-results'
		});
	};

	const addResults = function(list, results) {
		results.forEach(result => {
			if (result.title == '') {
				return;
			}

			add(list, result);
		});
	};
}));
