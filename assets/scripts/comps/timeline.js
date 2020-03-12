$('.timeline', wall => {
	const apiSuffix = 'index.json';

	const pager = wall.find('.pager[rel="next"]');
	const loader = wall.createChild('span')
		.addClass('loader')
		.addClass('is-hidden');

	pager.on('click', (_, evt) => {
		evt.preventDefault();

		pager.addClass('is-hidden');
		loader.removeClass('is-hidden');

		$.delay(360, () => $.json(loadMoreQuery, json => {

			json.data.forEach(post => addChildPost(wall, post));

			pager.removeClass('is-hidden');
			loader.addClass('is-hidden');

			// history.pushState({ url: loadMoreQuery }, loadMoreQuery.replace(removeMe, ''), loadMoreQuery.replace(removeMe, ''));

			pager.addAttribute('href', json.links.next);
			if (!loadMoreQuery) {
				a.delete();
			}
		}));
	});
});

function addChildPost(wall, post) {
	const article = wall.createChild('article')
		.addClass('timeline-item')
		.addClass(`is-${post.type}`);

	const header = article.createChild('header');
	const a = header.createChild('a')
		.addAttribute('href', post.permalink);
	a.createChild('h3')
		.text(post.title);
}
