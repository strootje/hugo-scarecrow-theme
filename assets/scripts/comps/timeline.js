$('.timeline', wall => {
	const removeMe = 'index.json';
	let loadMoreQuery = '/posts/index.json';

	wall.find('a[rel="next"]', a => a.on('click', (_, evt) => {
		evt.preventDefault();

		a.addClass('is-hidden');
		wall.find('.loader', loader => loader.removeClass('is-hidden'));

		$.delay(360, () => $.json(loadMoreQuery, json => {

			json.data.forEach(post => addChildPost(wall, post));
			
			a.removeClass('is-hidden');
			wall.find('.loader', loader => loader.addClass('is-hidden'));

			// history.pushState({ url: loadMoreQuery }, loadMoreQuery.replace(removeMe, ''), loadMoreQuery.replace(removeMe, ''));

			loadMoreQuery = json.links.next;
			if (!loadMoreQuery) {
				a.delete();
			}
		}));
	}));
});

function addChildPost(wall, post) {
	wall.createChild('article', article => {
		article.addClass('post');
		article.addClass(`is-${post.type}`);

		article.createChild('header', header => {
			header.createChild('a', a => {
				a.addAttribute('href', post.permalink);

				a.createChild('h3', h3 => {
					h3.addClass('title');
					h3.text(post.title);
				});
			});
		});

		article.createChild('footer', footer => {
		})
	});
}
