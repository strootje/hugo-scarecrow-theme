$('.popup', popup => {
	popup.find('a[data-action="open"]', node => {
		node.on('click', () => popup.addClass('is-open'));
	});

	popup.find('input[data-action="open"]', node => {
		node.throttle('keyup', 360, () => popup.addClass('is-open'));
	});

	popup.find('a[data-action="close"]', node => {
		node.on('click', () => popup.removeClass('is-open'));
	});
});
