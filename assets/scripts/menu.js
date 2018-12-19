$('.burger', p => p.on('click', self => {
	const sidebar = document.getElementById(self.dataset.target);

	self.classList.toggle('is-active');
	sidebar.classList.toggle('is-active');
}));
