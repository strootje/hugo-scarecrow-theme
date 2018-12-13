λ('.burger', self => self.addEventListener('click', () => {
	console.log(self);
}));


// 'use strict';

// (() => document.addEventListener('DOMContentLoaded', () => {
// 	document.querySelectorAll(".burger").forEach(burger => {
// 		burger.addEventListener('click', () => {
// 			const target = document.getElementsByClassName(burger.dataset.target)[0];

// 			burger.classList.toggle('is-active');
// 			target.classList.toggle('is-hidden-mobile');
// 		})
// 	});
// }))();
